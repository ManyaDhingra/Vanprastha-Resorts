import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
      include: {
        room: true,
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          error: "Booking not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(booking);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          error: "Booking not found",
        },
        {
          status: 404,
        }
      );
    }

    const cancelledBooking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json(cancelledBooking);
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



export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const { checkIn, checkOut, guests } = body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return NextResponse.json(
        { error: "Check-out must be after check-in." },
        { status: 400 }
      );
    }

    if (guests > booking.room.capacity) {
      return NextResponse.json(
        {
          error: `Maximum ${booking.room.capacity} guests allowed.`,
        },
        { status: 400 }
      );
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        roomId: booking.roomId,
        id: {
          not: id,
        },
        status: {
          not: "CANCELLED",
        },
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

    if (conflict) {
      return NextResponse.json(
        {
          error: "Room already booked for these dates.",
        },
        { status: 409 }
      );
    }

    const nights =
      (new Date(checkOut).getTime() -
        new Date(checkIn).getTime()) /
      (1000 * 60 * 60 * 24);

    const totalAmount =
      nights * booking.room.pricePerNight;

    const updatedBooking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
        totalAmount,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}