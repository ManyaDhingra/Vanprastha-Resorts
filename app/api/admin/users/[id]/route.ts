import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { verifyAdmin } from "@/lib/server/admin";
import { HttpError, handleApiError } from "@/lib/server/errors";

type Params = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/users/:id — promote/demote a user's role.
 * An admin cannot demote themselves (prevents locking out the last admin).
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const admin = await verifyAdmin(request);
    const { id } = await params;

    const body = await request.json();
    const role = body?.role;
    if (role !== "USER" && role !== "ADMIN") {
      throw new HttpError(400, "Role must be USER or ADMIN.");
    }

    if (id === admin.userId && role !== "ADMIN") {
      throw new HttpError(400, "You cannot demote your own account.");
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new HttpError(404, "User not found.");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}