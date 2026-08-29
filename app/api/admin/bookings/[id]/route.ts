import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { HttpError, handleApiError } from "@/lib/server/errors";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/bookings/:id — full booking details for admin view.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await verifyAdmin(request);
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        room: {
          select: {
            id: true,
            title: true,
            category: true,
            slug: true,
            pricePerNight: true,
            capacity: true,
            size: true,
            block: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            razorpayOrderId: true,
            razorpayPaymentId: true,
            refundId: true,
            createdAt: true,
          },
        },
      },
    });

    if (!booking) {
      throw new HttpError(404, "Booking not found.");
    }

    return NextResponse.json(booking);
  } catch (error) {
    return handleApiError(error);
  }
}

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

    // Conditional write: if a concurrent verify committed CONFIRMED between
    // the read above and this update, the WHERE fails — the paid booking is
    // NOT cancelled (no silent refund-less cancellation of captured money).
    const cancelledCount = await prisma.booking.updateMany({
      where: { id, status: "PENDING" },
      data: { status: "CANCELLED" },
    });
    if (cancelledCount.count !== 1) {
      // Raced with verify/sweep since the read: re-read and answer truthfully.
      const fresh = await prisma.booking.findUnique({ where: { id } });
      if (fresh?.status === "CONFIRMED") {
        throw new HttpError(
          409,
          "Booking was confirmed by the guest before cancellation — a refund flow is required."
        );
      }
      return NextResponse.json(fresh); // already cancelled by the sweep
    }
    const cancelled = await prisma.booking.findUnique({ where: { id } });
    return NextResponse.json(cancelled);
  } catch (error) {
    return handleApiError(error);
  }
}