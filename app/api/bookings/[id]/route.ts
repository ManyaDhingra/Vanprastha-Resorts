import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyToken, getAuthToken } from "@/lib/server/auth";
import {
  parseBookingDates,
  calculateNights,
  overlapWhere,
  validateGuests,
} from "@/lib/server/booking";
import { HttpError, handleApiError } from "@/lib/server/errors";

type Params = { params: Promise<{ id: string }> };

async function loadOwnedBooking(id: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: true, payment: true },
  });
  if (!booking) {
    throw new HttpError(404, "Booking not found.");
  }
  if (booking.userId !== userId) {
    throw new HttpError(404, "Booking not found.");
  }
  return booking;
}

/** GET /api/bookings/:id — owner only. */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const decoded = verifyToken(getAuthToken(request));
    const { id } = await params;
    const booking = await loadOwnedBooking(id, decoded.userId);
    return NextResponse.json(booking);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/bookings/:id — owner only, and only while PENDING.
 * CONFIRMED (paid) bookings are immutable by the user; CANCELLED cannot be
 * revived. The server recomputes the amount so clients can never underpay.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const decoded = verifyToken(getAuthToken(request));
    const { id } = await params;

    const booking = await loadOwnedBooking(id, decoded.userId);

    if (booking.status !== "PENDING") {
      throw new HttpError(
        409,
        booking.status === "CONFIRMED"
          ? "Confirmed bookings cannot be modified. Contact support for changes."
          : "Cancelled bookings cannot be modified."
      );
    }

    const body = await request.json();
    const { checkIn, checkOut, guests } = body ?? {};

    const { checkIn: inDate, checkOut: outDate } = parseBookingDates(
      String(checkIn ?? ""),
      String(checkOut ?? "")
    );

    validateGuests(guests, booking.room.capacity);

    const nights = calculateNights(inDate, outDate);
    const totalAmount = nights * booking.room.pricePerNight;

    const conflicting = await prisma.booking.findFirst({
      where: overlapWhere(booking.roomId, inDate, outDate, id),
    });
    if (conflicting) {
      throw new HttpError(409, "Room is already booked for the selected dates.");
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        checkIn: inDate,
        checkOut: outDate,
        guests: guests as number,
        totalAmount,
      },
    });

    // The amount/dates changed: any order created for the old amount must not
    // remain verifiable (a stale order would fail the live-amount assert in
    // verify, but clearing the binding makes the failure early and clean —
    // "create a new order"). Bound order ids are the only handle verification
    // uses, so clearing them orphans the old Razorpay order safely.
    await prisma.payment.updateMany({
      where: { bookingId: id, status: "PENDING" },
      data: { razorpayOrderId: null, razorpayPaymentId: null, razorpaySignature: null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/bookings/:id — owner only; cancels (soft-delete) the booking.
 * Only PENDING bookings can be cancelled by the user. Cancellation frees the
 * dates immediately: the exclusion constraint only covers PENDING/CONFIRMED,
 * so the room becomes bookable again.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const decoded = verifyToken(getAuthToken(request));
    const { id } = await params;

    const booking = await loadOwnedBooking(id, decoded.userId);

    if (booking.status !== "PENDING") {
      throw new HttpError(
        409,
        booking.status === "CONFIRMED"
          ? "Confirmed bookings cannot be cancelled online. Contact support."
          : "Booking is already cancelled."
      );
    }

    const cancelled = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(cancelled);
  } catch (error) {
    return handleApiError(error);
  }
}