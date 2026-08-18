import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import bcrypt from "bcrypt";
import { signAuthToken } from "@/lib/server/auth";
import { setSessionCookie } from "@/lib/server/auth";
import { HttpError, handleApiError } from "@/lib/server/errors";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";

// Dummy hash compared against when the email doesn't exist, so the response
// time doesn't reveal whether an account exists (timing-based enumeration).
const DUMMY_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

// Brute-force guards (fixed window, in-memory — see rate-limit.ts).
const IP_WINDOW = 15 * 60 * 1000;
const IP_LIMIT = 30;
const EMAIL_WINDOW = 15 * 60 * 1000;
const EMAIL_LIMIT = 10;

function normalizeEmail(email: unknown) {
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "A valid email address is required.");
  }
  return email.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    // Rate-limit before any work (IP first, then per-account after parsing).
    const ip = clientIp(request);
    const ipGate = rateLimit(`login:ip:${ip}`, IP_LIMIT, IP_WINDOW);
    if (!ipGate.allowed) {
      throw new HttpError(429, "Too many attempts. Please try again later.");
    }

    const body = await request.json();
    const email = normalizeEmail(body?.email);
    const password = body?.password;

    if (typeof password !== "string" || password.length === 0) {
      throw new HttpError(400, "Email and password are required.");
    }

    const accountGate = rateLimit(`login:${email}`, EMAIL_LIMIT, EMAIL_WINDOW);
    if (!accountGate.allowed) {
      throw new HttpError(
        429,
        "Too many attempts for this account. Please try again later."
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always run bcrypt.compare — against a dummy hash when the user is
    // missing — to keep timing uniform.
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password ?? DUMMY_HASH
    );

    if (!user || !isPasswordCorrect) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const token = signAuthToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return handleApiError(error);
  }
}