import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { handleApiError } from "@/lib/server/errors";

/**
 * GET /api/admin/revenue — revenue + booking aggregates.
 * Aggregate endpoint for the admin dashboard and future consumers
 * (reports, exports, mobile clients).
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);

    // Total revenue from successful payments
    const revenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    });

    const [totalBookings, confirmedBookings, pendingBookings, cancelledBookings] =
      await Promise.all([
        prisma.booking.count(),
        prisma.booking.count({ where: { status: "CONFIRMED" } }),
        prisma.booking.count({ where: { status: "PENDING" } }),
        prisma.booking.count({ where: { status: "CANCELLED" } }),
      ]);

    return NextResponse.json({
      totalRevenue: revenue._sum.amount ?? 0,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
    });
  } catch (error) {
    return handleApiError(error);
  }
}