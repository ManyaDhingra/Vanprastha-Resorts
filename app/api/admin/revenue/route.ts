import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    verifyAdmin(request);

    // Total revenue from successful payments
    const revenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: "SUCCESS",
      },
    });

    // Booking statistics
    const totalBookings = await prisma.booking.count();

    const confirmedBookings = await prisma.booking.count({
      where: {
        status: "CONFIRMED",
      },
    });

    const pendingBookings = await prisma.booking.count({
      where: {
        status: "PENDING",
      },
    });

    const cancelledBookings = await prisma.booking.count({
      where: {
        status: "CANCELLED",
      },
    });

    return NextResponse.json({
      totalRevenue: revenue._sum.amount ?? 0,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
    });
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