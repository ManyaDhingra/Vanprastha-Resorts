import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { HttpError, handleApiError } from "@/lib/server/errors";
import { z } from "zod";

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

/** GET /api/admin/blocks — all blocks with room counts. */
export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(request);
    const blocks = await prisma.block.findMany({
      orderBy: { startingPrice: "asc" },
      include: { _count: { select: { rooms: true } } },
    });
    return NextResponse.json(blocks);
  } catch (error) {
    return handleApiError(error);
  }
}

/** POST /api/admin/blocks — create a block (validated). */
export async function POST(request: NextRequest) {
  try {
    await verifyAdmin(request);

    const body = await request.json();
    const parsed = blockSchema.parse({
      ...body,
      startingPrice: typeof body?.startingPrice === "string"
        ? Number(body.startingPrice)
        : body?.startingPrice,
    });

    const existing = await prisma.block.findUnique({
      where: { slug: parsed.slug },
    });
    if (existing) {
      throw new HttpError(409, "A block with this slug already exists.");
    }

    const block = await prisma.block.create({ data: parsed });
    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
