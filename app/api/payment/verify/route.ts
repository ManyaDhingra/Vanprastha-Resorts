import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import crypto from "crypto";
import { getRazorpay } from "@/lib/server/razorpay";
import { getAuthToken, verifyToken } from "@/lib/server/auth";
import { HttpError, handleApiError } from "@/lib/server/errors";

/**
 * POST /api/payment/verify — confirm a Razorpay payment.
 *
 * Security model:
 * - The booking is derived from the STORED razorpayOrderId on the Payment
 *   row — the client-supplied bookingId is ignored. A signature from a cheap
 *   order therefore cannot confirm an expensive booking.
 * - The order is re-fetched from Razorpay server-side and its amount must
 *   match the stored payment amount (and booking totalAmount).
 * - HMAC signature check (order_id|payment_id) still applies.
 * - Idempotent: re-verifying an already-confirmed payment returns the same
 *   success (no P2002 crash, no double state change).
 * - Atomic: payment SUCCESS + booking CONFIRMED inside one transaction.
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(getAuthToken(request));

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      body ?? {};

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      throw new HttpError(400, "Incomplete payment payload.");
    }

    // Derive the payment + booking from the stored order id. Never from a
    // client-supplied booking id.
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: razorpay_order_id },
      include: { booking: true },
    });

    if (!payment || !payment.booking) {
      throw new HttpError(404, "No order found for this payment.");
    }
    if (payment.booking.userId !== decoded.userId) {
      throw new HttpError(403, "You can only verify your own payments.");
    }
    if (payment.booking.status !== "PENDING") {
      if (
        payment.booking.status === "CONFIRMED" &&
        payment.status === "SUCCESS"
      ) {
        // Idempotent re-verification.
        return NextResponse.json({
          success: true,
          alreadyConfirmed: true,
          message: "Payment already verified.",
        });
      }
      throw new HttpError(409, "Booking is not awaiting payment.");
    }

    const razorpay = getRazorpay();

    // Re-fetch the order server-side: amount and status must be trusted from
    // Razorpay, not from the client.
    let order;
    try {
      order = await razorpay.orders.fetch(razorpay_order_id);
    } catch {
      throw new HttpError(
        502,
        "Could not confirm payment status. Please retry."
      );
    }

    // The order must match the LIVE booking amount — not just the payment-row
    // snapshot. A booking modified after order creation (PUT changed dates or
    // guests) would otherwise accept an underpayment (H1 amount drift).
    const bookingTotalPaise = payment.booking.totalAmount * 100;
    if (Number(order.amount) !== bookingTotalPaise) {
      throw new HttpError(
        400,
        "Payment amount does not match the booking amount. Create a new order."
      );
    }
    if (payment.amount !== payment.booking.totalAmount) {
      throw new HttpError(
        400,
        "Booking amount changed since the order was created. Create a new order."
      );
    }
    if (order.currency !== "INR") {
      throw new HttpError(400, "Unexpected payment currency.");
    }
    if (order.status !== "paid") {
      throw new HttpError(400, "Payment is not completed.");
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new HttpError(503, "Payments are not configured. Contact support.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new HttpError(400, "Invalid payment signature.");
    }

    // Atomic confirm: payment SUCCESS + booking CONFIRMED.
    const [confirmedPayment] = await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: confirmedPayment.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}