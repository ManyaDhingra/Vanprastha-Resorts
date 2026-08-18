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
import { rateLimit } from "@/lib/server/rate-limit";
import { expireStalePendingBookings } from "@/lib/server/expiry";

/**
 * POST /api/bookings — create a booking (authenticated).
 * Server recomputes totalAmount from the room's price; the client never
 * supplies money amounts. The DB exclusion constraint (bookings_no_overlap)
 * is the backstop against the concurrent double-booking race.
 */
export async function POST(request: NextRequest) {
  try {
    const decoded = verifyToken(getAuthToken(request));

    // Inventory-hold guard: free slots held by abandoned PENDING bookings.
    await expireStalePendingBookings();

    // Per-user creation throttle (in-memory; see rate-limit.ts).
    const gate = rateLimit(`book:${decoded.userId}`, 20, 10 * 60 * 1000);
    if (!gate.allowed) {
      throw new HttpError(429, "Too many booking attempts. Please slow down.");
    }

    // Hold cap: without it, a client could keep creating PENDING bookings
    // (recreating before the 24h sweep) and block any room's dates forever
    // without ever paying. Three concurrent holds is plenty for a real guest.
    const activeHolds = await prisma.booking.count({
      where: { userId: decoded.userId, status: "PENDING" },
    });
    if (activeHolds >= 3) {
      throw new HttpError(
        409,
        "You already have 3 pending bookings. Pay or cancel one before creating another."
      );
    }

    const body = await request.json();
    const { roomId, checkIn, checkOut, guests } = body ?? {};

    if (typeof roomId !== "string" || !roomId) {
      throw new HttpError(400, "roomId is required.");
    }

    const { checkIn: inDate, checkOut: outDate } = parseBookingDates(
      String(checkIn ?? ""),
      String(checkOut ?? "")
    );

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room || !room.isActive) {
      throw new HttpError(404, "Room not found.");
    }

    validateGuests(guests, room.capacity);

    const nights = calculateNights(inDate, outDate);
    const totalAmount = nights * room.pricePerNight;

    const existing = await prisma.booking.findFirst({
      where: overlapWhere(roomId, inDate, outDate),
    });
    if (existing) {
      throw new HttpError(409, "Room is already booked for the selected dates.");
    }

    const booking = await prisma.booking.create({
      data: {
        userId: decoded.userId,
        roomId,
        checkIn: inDate,
        checkOut: outDate,
        guests: guests as number,
        totalAmount,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/bookings — the caller's own bookings only.
 * Admin reads go through /api/admin/bookings.
 */
export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(getAuthToken(request));

    const bookings = await prisma.booking.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      include: {
        room: { select: { id: true, title: true, slug: true, image: true } },
        payment: { select: { status: true, amount: true } },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return handleApiError(error);
  }
}