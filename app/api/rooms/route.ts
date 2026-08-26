import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { handleApiError } from "@/lib/server/errors";

/**
 * GET /api/rooms — public room catalog (active rooms only).
 * Read paths on the public site are server-rendered (see /rooms page); this
 * endpoint serves the client-side booking wizard, which needs a room list.
 */
export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      orderBy: { pricePerNight: "asc" },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    return handleApiError(error);
  }
}