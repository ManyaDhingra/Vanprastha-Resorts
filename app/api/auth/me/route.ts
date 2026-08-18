import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuthToken, verifyToken } from "@/lib/server/auth";
import { HttpError, handleApiError } from "@/lib/server/errors";

/**
 * GET /api/auth/me — validate the JWT against the DB and return the current
 * user. Used by the auth provider to restore/verify sessions on page load.
 */
export async function GET(request: NextRequest) {
  try {
    const decoded = verifyToken(getAuthToken(request));

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      throw new HttpError(401, "Account no longer exists.");
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}