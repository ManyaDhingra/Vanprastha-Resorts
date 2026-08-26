import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import bcrypt from "bcrypt";
import { signAuthToken, setSessionCookie, normalizeEmail } from "@/lib/server/auth";
import { HttpError, handleApiError } from "@/lib/server/errors";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";

// Registration is deliberately throttled harder than login: bcrypt cost-10
// hashing is CPU-expensive and the endpoint is unauthenticated, so without
// a gate it doubles as a CPU/DB DoS amplifier and an account-spam pipe.
const REG_WINDOW = 60 * 60 * 1000;
const REG_LIMIT = 5;

export async function POST(request: NextRequest) {
  try {
    // Rate-limit before any work (hashing included).
    const ipGate = rateLimit(`reg:${clientIp(request)}`, REG_LIMIT, REG_WINDOW);
    if (!ipGate.allowed) {
      throw new HttpError(
        429,
        "Too many registration attempts. Please try again later."
      );
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = normalizeEmail(body?.email);
    const password = body?.password;
    const phone = body?.phone;

    if (name.length < 2) {
      throw new HttpError(400, "Name must be at least 2 characters.");
    }
    if (name.length > 80) {
      throw new HttpError(400, "Name must be at most 80 characters.");
    }
    if (typeof password !== "string" || password.length < 8) {
      throw new HttpError(400, "Password must be at least 8 characters.");
    }
    // bcrypt only uses the first 72 bytes: two passwords sharing those bytes
    // authenticate identically, which is a silent collision. Cap it.
    if (password.length > 72) {
      throw new HttpError(400, "Password must be at most 72 characters.");
    }
    if (phone !== undefined && phone !== null && phone !== "") {
      if (typeof phone !== "string" || !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
        throw new HttpError(400, "Invalid phone number.");
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new HttpError(409, "An account with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = signAuthToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json(
      {
        message: "Registration successful",
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}