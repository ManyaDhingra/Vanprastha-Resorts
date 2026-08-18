import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getRazorpay } from "@/lib/server/razorpay";
import { getAuthToken, verifyToken } from "@/lib/server/auth";
import { HttpError, handleApiError } from "@/lib/server/errors";
import { PENDING_EXPIRY_MS } from "@/lib/server/expiry";

/**
 * POST /api/payment/create-order — create a Razorpay order for a booking.
 * Persists razorpayOrderId on the Payment row so verification can be bound to
 * the booking server-side (the client can never point a paid order at a
 * different, more expensive booking).
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(getAuthToken(request));

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
    if (booking.userId !== decoded.userId) {
      throw new HttpError(403, "You can only pay for your own bookings.");
    }
    if (booking.status !== "PENDING") {
      throw new HttpError(
        409,
        booking.status === "CONFIRMED"
          ? "Booking is already paid."
          : "Booking is cancelled."
      );
    }

    // Idempotency: if a LIVE order already exists for this booking, hand it
    // back instead of creating another. Overwriting razorpayOrderId would
    // orphan the previous order — a customer who paid against order A, then
    // had a retry overwrite the binding to order B, could never verify A
    // (404), yet Razorpay captured the money. Booking PUT clears the binding
    // when dates/amount change, so a binding here means "still mid-checkout".
    // An order older than the hold TTL is dead (Razorpay checkout windows
    // are minutes, not days): create a fresh one.
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId: booking.id },
    });
    if (existingPayment) {
      if (existingPayment.status === "SUCCESS") {
        throw new HttpError(409, "Booking is already paid.");
      }
      if (existingPayment.razorpayOrderId) {
        const orderAgeMs = Date.now() - existingPayment.updatedAt.getTime();
        if (orderAgeMs < PENDING_EXPIRY_MS) {
          return NextResponse.json({
            orderId: existingPayment.razorpayOrderId,
            amount: existingPayment.amount * 100,
            currency: "INR",
            bookingId: booking.id,
          });
        }
      }
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: booking.totalAmount * 100, // paise
      currency: "INR",
      receipt: booking.id,
    });

    // Bind the order to the booking inside a transaction that first
    // re-confirms the booking is still PENDING under the row lock — the
    // sweep or an admin cancel can commit between the status check above
    // and this write. The no-op status bump also refreshes the hold clock
    // (order creation is active guest intent).
    await prisma.$transaction(async (tx) => {
      const guard = await tx.booking.updateMany({
        where: { id: booking.id, status: "PENDING" },
        data: { updatedAt: new Date() },
      });
      if (guard.count !== 1) {
        throw new HttpError(409, "Booking is no longer awaiting payment.");
      }
      await tx.payment.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          status: "PENDING",
          razorpayOrderId: order.id,
        },
        update: {
          razorpayOrderId: order.id,
          amount: booking.totalAmount,
          status: "PENDING",
        },
      });
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingId: booking.id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}