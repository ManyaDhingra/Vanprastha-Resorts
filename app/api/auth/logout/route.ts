import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/server/auth";

/**
 * POST /api/auth/logout — clears the session cookie. Client storage
 * (localStorage token) is cleared by the auth provider.
 */
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
