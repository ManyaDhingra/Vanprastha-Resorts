import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { handleApiError } from "@/lib/server/errors";
import { todayIST } from "@/lib/utils";

/**
 * GET /api/admin/today — today's operations for the admin dashboard.
 * Returns check-ins, check-outs, and available room counts for today.
 */
export async function GET(request: Request) {
  try {
    await verifyAdmin(request);

    const todayStr = todayIST();
    const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);
    const startOfTomorrow = new Date(`${todayStr}T00:00:00.000Z`);
    startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);

    const [checkIns, checkOuts, totalActiveRooms, occupiedToday] =
      await Promise.all([
        prisma.booking.findMany({
          where: {
            checkIn: { gte: startOfToday, lt: startOfTomorrow },
            status: { not: "CANCELLED" },
          },
          include: {
            room: { select: { title: true, block: true } },
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.booking.findMany({
          where: {
            checkOut: { gte: startOfToday, lt: startOfTomorrow },
            status: { not: "CANCELLED" },
          },
          include: {
            room: { select: { title: true, block: true } },
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "asc" },
        }),
        prisma.room.count({ where: { isActive: true } }),
        prisma.booking.count({
          where: {
            status: "CONFIRMED",
            checkIn: { lt: startOfTomorrow },
            checkOut: { gt: startOfToday },
          },
        }),
      ]);

    return NextResponse.json({
      checkIns,
      checkOuts,
      totalActiveRooms,
      occupiedToday,
      availableToday: totalActiveRooms - occupiedToday,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
