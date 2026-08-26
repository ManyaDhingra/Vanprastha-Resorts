import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getRazorpay } from "@/lib/server/razorpay";
import { getWebhookSecret, verifyRazorpaySignature } from "@/lib/server/webhook";
import { HttpError, handleApiError } from "@/lib/server/errors";

/**
 * POST /api/payment/webhook — Razorpay server-to-server events.
 *
 * Closes the capture-without-confirm gap: the client verify call can be lost
 * (closed popup, dropped network, crash between capture and verify), leaving
 * money captured and the booking PENDING forever. This endpoint makes the
 * capture authoritative:
 *
 *  - payment.captured  -> confirm the booking with the SAME guarded atomic
 *                         update the verify route uses (status + amount in
 *                         WHERE, race-loser rolls back). If the booking was
 *                         cancelled before capture, refund immediately —
 *                         money is never left stranded on a cancelled stay.
 *  - payment.failed    -> payment FAILED; booking stays PENDING so the guest
 *                         can retry checkout with a fresh order.
 *  - refund.processed  -> payment REFUNDED + booking CANCELLED (self-heals
 *                         the admin-refund race window).
 *  - refund.failed     -> ignored (money still captured; admin retries).
 *
 * Security: HMAC-SHA256 over the RAW body using a webhook secret configured
 * separately from the API keys. Unverifiable events are rejected before any
 * DB work. Unknown order ids are acknowledged without state changes (never
 * react to strangers). 5xx responses make Razorpay retry; 4xx do not.
 */
type PaymentEntity = { id?: string; order_id?: string; amount?: number; status?: string };
type RefundEntity = { id?: string; payment_id?: string; amount?: number; status?: string };

export async function POST(request: NextRequest) {
  try {
    const secret = getWebhookSecret();
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!verifyRazorpaySignature(rawBody, signature, secret)) {
      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: { entity?: PaymentEntity };
        refund?: { entity?: RefundEntity };
      };
    };

    const event = payload.event ?? "";
    const payment = payload.payload?.payment?.entity;
    const refund = payload.payload?.refund?.entity;

    if (event === "payment.captured" && payment?.id && payment.order_id) {
      await handleCaptured(payment);
    } else if (event === "payment.failed" && payment?.order_id) {
      await handleFailed(payment.order_id);
    } else if (event === "refund.processed" && refund?.id && refund.payment_id) {
      await handleRefundProcessed(refund);
    }
    // Everything else (order.paid, refund.failed, transfer.*, ...) is either
    // redundant or deliberately ignored.

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleApiError(error);
  }
}

async function handleCaptured(entity: PaymentEntity) {
  const orderId = entity.order_id;
  const paymentId = entity.id;
  if (!orderId || !paymentId) return; // both ids are required to act
  const capturedPaise = entity.amount ?? 0;

  const payment = await prisma.payment.findFirst({
    where: { razorpayOrderId: orderId },
    include: { booking: true },
  });
  // Unknown order (or amount that does not match what we charged): no state
  // changes. The exact-amount check stops a tampered/partial capture from
  // confirming an expensive booking.
  if (!payment || payment.amount * 100 !== capturedPaise) return;
  if (payment.status === "SUCCESS" || payment.status === "REFUNDED") return;

  if (payment.booking.status === "PENDING") {
    // Standard confirmation — identical guards to the client verify path.
    let confirmed = false;
    let refundInstead = false;
    try {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.booking.updateMany({
          where: {
            id: payment.bookingId,
            status: "PENDING",
            totalAmount: payment.amount,
          },
          data: { status: "CONFIRMED" },
        });
        if (updated.count !== 1) {
          throw new Error("webhook-confirm-race"); // rollback, handled below
        }
        await tx.payment.updateMany({
          where: { id: payment.id, status: "PENDING" },
          data: { status: "SUCCESS", razorpayPaymentId: entity.id },
        });
        confirmed = true;
      });
    } catch (e) {
      if (e instanceof HttpError) throw e;
      // The transaction rolled back and the money is captured: someone
      // changed the booking between the capture and this write. Never
      // strand the funds — refund immediately.
      refundInstead = true;
    }
    if (confirmed) return;
    if (refundInstead) {
      const fresh = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: { booking: true },
      });
      if (fresh && fresh.booking.status !== "CONFIRMED") {
        // Cancelled or amount-edited: refund (verify would have flipped it
        // CONFIRMED if it won the race).
        await refundCaptured(fresh, entity.id);
      }
      return;
    }
  }

  if (payment.booking.status === "CANCELLED") {
    // Captured onto a cancelled booking — never leave money stranded.
    await refundCaptured(payment, entity.id);
    return;
  }

  // booking CONFIRMED but the payment row never flipped (verify lost): the
  // capture IS the receipt.
  await prisma.payment.updateMany({
    where: { id: payment.id, status: "PENDING" },
    data: { status: "SUCCESS", razorpayPaymentId: entity.id },
  });
}

async function handleFailed(orderId: string) {
  // Guest stays able to retry: booking remains PENDING, the failed attempt
  // is recorded (audit), and the stale order binding is cleared so a fresh
  // create-order can bind a new one.
  await prisma.payment.updateMany({
    where: { razorpayOrderId: orderId, status: "PENDING" },
    data: { status: "FAILED", razorpayOrderId: null },
  });
}

async function handleRefundProcessed(entity: RefundEntity) {
  const payment = await prisma.payment.findFirst({
    where: { razorpayPaymentId: entity.payment_id },
    include: { booking: true },
  });
  if (!payment || payment.amount * 100 !== (entity.amount ?? 0)) return;
  if (payment.status === "REFUNDED") return;

  await prisma.$transaction(async (tx) => {
    // Money is back with the guest: release the inventory too.
    await tx.booking.updateMany({
      where: { id: payment.bookingId, status: "CONFIRMED" },
      data: { status: "CANCELLED" },
    });
    await tx.payment.updateMany({
      where: { id: payment.id, status: "SUCCESS" },
      data: { status: "REFUNDED", refundId: entity.id },
    });
  });
}

async function refundCaptured(
  payment: { id: string; bookingId: string; amount: number; razorpayPaymentId: string | null },
  capturedPaymentId: string | undefined
) {
  const razorpay = getRazorpay();
  // The entity id is always present at the call sites (handleCaptured guards
  // it); the razorpayPaymentId fallback covers a replayed/stale event.
  const payment_id = capturedPaymentId ?? payment.razorpayPaymentId;
  if (!payment_id) return;
  const refund = await (razorpay.payments.refund(payment_id, {
    amount: payment.amount * 100, // paise — the smallest unit of currency
    notes: { bookingId: payment.bookingId, source: "webhook-capture-on-cancelled" },
  }) as Promise<{ id: string }>);
  await prisma.payment.updateMany({
    where: { id: payment.id, status: "PENDING" },
    data: {
      status: "REFUNDED",
      refundId: refund.id,
      razorpayPaymentId: payment_id,
    },
  });
}