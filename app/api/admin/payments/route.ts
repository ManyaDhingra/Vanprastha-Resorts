import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { handleApiError } from "@/lib/server/errors";

/** GET /api/admin/payments — payment records with booking + user context. */
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);

    // Bounded: the list must not grow into a full-table memory load.
    const page = Math.max(1, Number(request.nextUrl.searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 20));

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        booking: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            status: true,
            room: { select: { title: true } },
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    return handleApiError(error);
  }
}