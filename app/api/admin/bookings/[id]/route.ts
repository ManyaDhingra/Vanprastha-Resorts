import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { HttpError, handleApiError } from "@/lib/server/errors";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/bookings/:id — admin cancellation (H2).
 * Operators need a first-class way to release inventory held by abandoned
 * PENDING reservations. Only PENDING → CANCELLED is allowed here; CONFIRMED
 * bookings require a refund flow (out of scope) and are rejected.
 * Idempotent: cancelling an already-cancelled booking is a no-op success.
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await verifyAdmin(request);
    const { id } = await params;

    const body = await request.json();
    if (body?.status !== "CANCELLED") {
      throw new HttpError(
        400,
        "Only status: \"CANCELLED\" is supported."
      );
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new HttpError(404, "Booking not found.");
    }

    if (booking.status === "CONFIRMED") {
      throw new HttpError(
        409,
        "Confirmed bookings cannot be cancelled online — a refund flow is required."
      );
    }
    if (booking.status === "CANCELLED") {
      return NextResponse.json(booking); // idempotent
    }

    const cancelled = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json(cancelled);
  } catch (error) {
    return handleApiError(error);
  }
}