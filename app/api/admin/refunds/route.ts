import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { getRazorpay } from "@/lib/server/razorpay";
import { HttpError, handleApiError } from "@/lib/server/errors";

/**
 * POST /api/admin/refunds — refund a paid (CONFIRMED) booking.
 *
 * The money move happens on Razorpay's side first; local state (booking ->
 * CANCELLED, payment -> REFUNDED) flips atomically only after Razorpay
 * accepts. If Razorpay rejects the refund, nothing changes locally and the
 * admin gets a clear 502 — the money stays with the resort until the
 * problem is fixed and the action retried.
 *
 * Idempotent: an already-refunded payment answers 409-adjacent honestly via
 * its guards (payment status is part of every WHERE). The refund.processed
 * webhook self-heals any race between this endpoint and a concurrent
 * webhook event.
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const body = await request.json();
    const { bookingId } = body ?? {};
    if (typeof bookingId !== "string" || !bookingId) {
      throw new HttpError(400, "bookingId is required.");
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });
    if (!booking) {
      throw new HttpError(404, "Booking not found.");
    }
    if (booking.status !== "CONFIRMED") {
      throw new HttpError(
        409,
        "Only confirmed bookings can be refunded."
      );
    }
    const payment = booking.payment;
    if (!payment || payment.status !== "SUCCESS" || !payment.razorpayPaymentId) {
      throw new HttpError(
        409,
        "This booking has no captured payment to refund."
      );
    }

    // Money move first. A Razorpay-side rejection must NOT touch local state.
    let refund: { id: string };
    try {
      refund = await (getRazorpay().payments.refund(payment.razorpayPaymentId, {
        amount: payment.amount * 100, // paise — the smallest unit of currency
        notes: { bookingId: booking.id, source: "admin-manual" },
      }) as Promise<{ id: string }>);
    } catch {
      throw new HttpError(
        502,
        "Refund failed at Razorpay. No changes were made; please retry."
      );
    }

    // Atomic local flip, guarded: if a webhook already processed this refund
    // (or the booking changed) in the meantime, the WHERE loses and the
    // admin gets the truth instead of a double state change.
    await prisma.$transaction(async (tx) => {
      const p = await tx.payment.updateMany({
        where: { id: payment.id, status: "SUCCESS" },
        data: { status: "REFUNDED", refundId: refund.id },
      });
      const b = await tx.booking.updateMany({
        where: { id: booking.id, status: "CONFIRMED" },
        data: { status: "CANCELLED" },
      });
      if (p.count !== 1 || b.count !== 1) {
        throw new HttpError(
          409,
          "Booking changed while the refund was processing. Refresh and retry."
        );
      }
    });

    return NextResponse.json({ success: true, refundId: refund.id });
  } catch (error) {
    return handleApiError(error);
  }
}