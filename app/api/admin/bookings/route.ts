import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { handleApiError } from "@/lib/server/errors";
import { expireStalePendingBookings } from "@/lib/server/expiry";

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);

    // Keep the list honest: surface abandoned PENDING holds as CANCELLED.
    await expireStalePendingBookings();

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        room: {
          select: { id: true, title: true, category: true, pricePerNight: true },
        },
        user: { select: { id: true, name: true, email: true } },
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
    return handleApiError(error);
  }
}