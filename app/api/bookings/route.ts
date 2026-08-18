import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {

    // Get JWT from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    const body = await request.json();

    const {
      roomId,
      checkIn,
      checkOut,
      guests
    } = body;

    if (!roomId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // Check room exists
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Calculate number of nights
    const nights = Math.ceil(
      (new Date(checkOut).getTime() -
        new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const totalAmount = nights * room.pricePerNight;
    // Check that checkout is after check-in
if (new Date(checkOut) <= new Date(checkIn)) {
  return NextResponse.json(
    { error: "Check-out date must be after check-in date." },
    { status: 400 }
  );
}

// Check guest capacity
if (guests > room.capacity) {
  return NextResponse.json(
    {
      error: `This room allows a maximum of ${room.capacity} guests.`,
    },
    { status: 400 }
  );
}
    // Check if the room is available for the given dates
    const existingBooking = await prisma.booking.findFirst({
  where: {
    roomId: roomId,

    // Ignore cancelled bookings
    status: {
      not: "CANCELLED",
    },

    // Check for overlapping dates
    AND: [
      {
        checkIn: {
          lt: new Date(checkOut),
        },
      },
      {
        checkOut: {
          gt: new Date(checkIn),
        },
      },
    ],
  },
});
if (existingBooking) {
  return NextResponse.json(
    {
      error: "Room is already booked for the selected dates.",
    },
    {
      status: 409,
    }
  );
}
    // Create booking
    const booking = await prisma.booking.create({

      data: {

        userId: decoded.userId,

        roomId,

        checkIn: new Date(checkIn),

        checkOut: new Date(checkOut),

        guests,

        totalAmount,

      },

    });

    return NextResponse.json(booking, {
      status: 201,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: {
      room: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      payment: true,
    },
  });

  return NextResponse.json(bookings);
}