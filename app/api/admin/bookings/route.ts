import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);

    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        room: {
          select: {
            id: true,
            title: true,
            category: true,
            pricePerNight: true,
          },
        },

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            razorpayPaymentId: true,
          },
        },
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}