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
 * - Atomic + conditional: payment SUCCESS + booking CONFIRMED inside one
 *   transaction, but only while the booking is still PENDING at the verified
 *   amount — a concurrent cancel/sweep/PUT loses cleanly (409, rollback).
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

    // Atomic confirm: payment SUCCESS + booking CONFIRMED — but only if the
    // booking is STILL PENDING and STILL at the amount this order was
    // matched against. The checks above run outside the transaction; between
    // them and this write an admin cancel, the expiry sweep, or a booking PUT
    // (dates/amount change) can interleave. updateMany re-evaluates its WHERE
    // under the row lock after any concurrent writer commits, so the losing
    // side of those races gets a clean rollback here instead of resurrecting
    // a cancelled booking (or confirming it at an unverified amount). A
    // count mismatch aborts the transaction, rolling back the payment row.
    const confirmedPayment = await prisma.$transaction(async (tx) => {
      // The WHERE uses payment.amount — the amount this order was created
      // against — not the booking's current total, which a concurrent PUT
      // may have changed since the checks above ran. The WHERE re-evaluates
      // under the row lock, so an amount-changing PUT or any cancel/sweep
      // interleaving loses with a rollback (no underpaid confirmation).
      const bookingUpdate = await tx.booking.updateMany({
        where: {
          id: payment.bookingId,
          status: "PENDING",
          totalAmount: payment.amount,
        },
        data: { status: "CONFIRMED" },
      });
      if (bookingUpdate.count !== 1) {
        throw new HttpError(
          409,
          "Booking changed while the payment was being processed. Please contact support."
        );
      }
      return tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: confirmedPayment.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}