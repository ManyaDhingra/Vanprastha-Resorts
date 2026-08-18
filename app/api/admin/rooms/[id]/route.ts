import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { roomSchema, intField } from "@/lib/server/room-schema";
import { HttpError, handleApiError } from "@/lib/server/errors";

type Params = { params: Promise<{ id: string }> };

async function loadRoom(id: string) {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) {
    throw new HttpError(404, "Room not found.");
  }
  return room;
}

/** PUT /api/admin/rooms/:id — full update (validated, slug-uniqueness checked). */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await verifyAdmin(request);
    const { id } = await params;
    await loadRoom(id);

    const body = await request.json();
    const parsed = roomSchema.parse({
      ...body,
      capacity: intField(body?.capacity),
      size: intField(body?.size),
      pricePerNight: intField(body?.pricePerNight),
    });

    const slugOwner = await prisma.room.findUnique({
      where: { slug: parsed.slug },
    });
    if (slugOwner && slugOwner.id !== id) {
      throw new HttpError(409, "A room with this slug already exists.");
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: {
        slug: parsed.slug,
        title: parsed.title,
        category: parsed.category,
        description: parsed.description,
        capacity: parsed.capacity,
        size: parsed.size,
        pricePerNight: parsed.pricePerNight,
        image: parsed.image,
        highlights: parsed.highlights ?? [],
        // Only touch isActive when the client actually sent it: a partial
        // update (e.g. rename) must not silently re-activate a room an admin
        // deliberately deactivated. undefined omits the field from the write.
        isActive: parsed.isActive ?? undefined,
      },
    });

    return NextResponse.json(updatedRoom);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/rooms/:id — hard delete only when the room has no booking
 * history (FK Restrict). Rooms with bookings must be deactivated instead
 * (PUT isActive=false) so booking/payment records are never destroyed.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await verifyAdmin(request);
    const { id } = await params;
    await loadRoom(id);

    await prisma.room.delete({ where: { id } });

    return NextResponse.json({ message: "Room deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}