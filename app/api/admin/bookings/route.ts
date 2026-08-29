import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { handleApiError } from "@/lib/server/errors";
import { expireStalePendingBookings } from "@/lib/server/expiry";

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);

    await expireStalePendingBookings();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const checkInFrom = searchParams.get("checkInFrom");
    const checkInTo = searchParams.get("checkInTo");

    const where: Record<string, unknown> = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { room: { title: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (checkInFrom || checkInTo) {
      where.checkIn = {};
      if (checkInFrom) (where.checkIn as Record<string, string>).gte = checkInFrom;
      if (checkInTo) (where.checkIn as Record<string, string>).lte = checkInTo;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          room: {
            select: { id: true, title: true, category: true, pricePerNight: true, blockRelation: { select: { id: true, name: true, slug: true } } },
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
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({ bookings, total, page, limit });
  } catch (error) {
    return handleApiError(error);
  }
}