import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { handleApiError } from "@/lib/server/errors";

/** GET /api/admin/payments — payment records with booking + user context. */
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
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