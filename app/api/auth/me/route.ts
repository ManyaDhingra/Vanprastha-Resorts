import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/server/admin";
import { handleApiError } from "@/lib/server/errors";

/**
 * GET /api/auth/me — validate the JWT against the DB and return the current
 * user. Used by the auth provider to restore/verify sessions on page load.
 * Shares verifyUser with the admin gate so the two can never drift.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyUser(request);
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}