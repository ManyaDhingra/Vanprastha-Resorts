import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { HttpError, handleApiError } from "@/lib/server/errors";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const blockSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens."),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(60),
  view: z.string().min(2).max(60),
  startingPrice: z.number().int().min(1),
  image: z
    .string()
    .min(1)
    .max(500)
    .refine(
      (v) => v.startsWith("/images/"),
      "Image must be a local path under /images/."
    ),
  isActive: z.boolean().optional(),
});

async function loadBlock(id: string) {
  const block = await prisma.block.findUnique({ where: { id } });
  if (!block) {
    throw new HttpError(404, "Block not found.");
  }
  return block;
}

/** PUT /api/admin/blocks/:id — update a block. */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await verifyAdmin(request);
    const { id } = await params;
    await loadBlock(id);

    const body = await request.json();
    const parsed = blockSchema.parse({
      ...body,
      startingPrice: typeof body?.startingPrice === "string"
        ? Number(body.startingPrice)
        : body?.startingPrice,
    });

    const slugOwner = await prisma.block.findUnique({
      where: { slug: parsed.slug },
    });
    if (slugOwner && slugOwner.id !== id) {
      throw new HttpError(409, "A block with this slug already exists.");
    }

    const updated = await prisma.block.update({
      where: { id },
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description,
        category: parsed.category,
        view: parsed.view,
        startingPrice: parsed.startingPrice,
        image: parsed.image,
        isActive: parsed.isActive ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/blocks/:id — delete a block.
 * Only allowed if the block has no rooms assigned.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await verifyAdmin(request);
    const { id } = await params;
    const block = await loadBlock(id);

    const roomCount = await prisma.room.count({ where: { blockId: id } });
    if (roomCount > 0) {
      throw new HttpError(
        409,
        `Cannot delete block "${block.name}" — ${roomCount} room(s) are assigned to it. Unassign all rooms first.`
      );
    }

    await prisma.block.delete({ where: { id } });
    return NextResponse.json({ message: "Block deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
