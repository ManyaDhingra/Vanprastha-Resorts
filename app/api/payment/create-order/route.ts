import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getRazorpay } from "@/lib/server/razorpay";
import { getAuthToken, verifyToken } from "@/lib/server/auth";
import { HttpError, handleApiError } from "@/lib/server/errors";

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

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: booking.totalAmount * 100, // paise
      currency: "INR",
      receipt: booking.id,
    });

    // Bind the order to the booking before any payment attempt.
    await prisma.payment.upsert({
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