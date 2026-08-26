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

    // Bounded: the list must not grow into a full-table memory load.
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 20));

    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
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