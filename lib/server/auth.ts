import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { HttpError } from "./errors";
import { TOKEN_COOKIE } from "../utils";

export type AuthTokenPayload = {
  id: string;
  email: string;
  role: string;
};

export type DecodedToken = {
  userId: string;
  email: string;
  role: string;
};

const JWT_ALGORITHM = "HS256";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    // Fail loudly at first use, not at module import. Production must set a
    // strong secret; a weak one would make tokens forgeable.
    throw new Error(
      "JWT_SECRET must be set to at least 32 characters."
    );
  }
  return secret;
}

export function signAuthToken(user: AuthTokenPayload) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
      algorithm: JWT_ALGORITHM,
    }
  );
}

export function verifyToken(token: string): DecodedToken {
  try {
    return jwt.verify(token, getJwtSecret(), {
      algorithms: [JWT_ALGORITHM],
    }) as DecodedToken;
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Session expired. Please log in again.");
    }
    if (e instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, "Invalid session.");
    }
    throw e;
  }
}

/**
 * Extracts the Bearer token from a request's Authorization header.
 * Throws 401 HttpError when absent or malformed.
 */
export function getAuthToken(request: Request): string {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new HttpError(401, "Authentication required.");
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Malformed Authorization header.");
  }
  return token;
}

/**
 * Sets the session cookie so page navigation (e.g. /admin/* middleware gate)
 * can authenticate without a Bearer header. The same JWT is also returned in
 * JSON for client-side fetch calls.
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7d, matches JWT expiry
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Validates + normalizes an email address. Single source for login and
 * register so both endpoints can never disagree about what is accepted.
 */
export function normalizeEmail(email: unknown): string {
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "A valid email address is required.");
  }
  return email.trim().toLowerCase();
}