import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { roomSchema, intField } from "@/lib/server/room-schema";
import { HttpError, handleApiError } from "@/lib/server/errors";

/** GET /api/admin/rooms — all rooms, including inactive (admin view). */
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);
    const rooms = await prisma.room.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { bookings: true } },
        blockRelation: { select: { id: true, name: true, slug: true } },
      },
    });
    return NextResponse.json(rooms);
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/admin/rooms — create a room (validated). */
export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const body = await request.json();
    const parsed = roomSchema.parse({
      ...body,
      capacity: intField(body?.capacity),
      size: intField(body?.size),
      pricePerNight: intField(body?.pricePerNight),
    });

    const existingRoom = await prisma.room.findUnique({
      where: { slug: parsed.slug },
    });
    if (existingRoom) {
      throw new HttpError(409, "A room with this slug already exists.");
    }

    if (parsed.blockId) {
      const block = await prisma.block.findUnique({ where: { id: parsed.blockId } });
      if (!block) {
        throw new HttpError(400, "Invalid block ID.");
      }
    }

    const room = await prisma.room.create({
      data: {
        slug: parsed.slug,
        title: parsed.title,
        category: parsed.category,
        block: '',
        description: parsed.description,
        capacity: parsed.capacity,
        size: parsed.size,
        pricePerNight: parsed.pricePerNight,
        image: parsed.image,
        highlights: parsed.highlights ?? [],
        isActive: parsed.isActive ?? true,
        blockId: parsed.blockId ?? null,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
