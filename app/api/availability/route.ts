import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { parseBookingDates, overlapWhere } from "@/lib/server/booking";
import { HttpError, handleApiError } from "@/lib/server/errors";
import { expireStalePendingBookings } from "@/lib/server/expiry";

/**
 * GET /api/availability?roomId=...&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
 * Public availability check. Returns only a boolean — never booking data.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const roomId = searchParams.get("roomId");
    const checkInParam = searchParams.get("checkIn");
    const checkOutParam = searchParams.get("checkOut");

    if (!roomId || !checkInParam || !checkOutParam) {
      throw new HttpError(
        400,
        "roomId, checkIn and checkOut are required."
      );
    }

    const { checkIn, checkOut } = parseBookingDates(
      checkInParam,
      checkOutParam
    );

    // Free slots held by abandoned PENDING bookings before answering.
    await expireStalePendingBookings();

    const room = await prisma.room.findFirst({
      where: { id: roomId, isActive: true },
    });
    if (!room) {
      throw new HttpError(404, "Room not found.");
    }

    const conflicting = await prisma.booking.findFirst({
      where: overlapWhere(roomId, checkIn, checkOut),
      select: { id: true },
    });

    return NextResponse.json({ available: !conflicting });
  } catch (error) {
    return handleApiError(error);
  }
}