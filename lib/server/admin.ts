import { getAuthToken, verifyToken } from "./auth";
import { prisma } from "./prisma";
import { HttpError } from "./errors";

/**
 * Verifies the Authorization header AND re-checks the role against the
 * database. A JWT role claim is never trusted alone: a demoted or deleted
 * admin loses access immediately, not at token expiry.
 *
 * Throws HttpError (401 / 403). Callers map it via handleApiError.
 */
export async function verifyAdmin(request: Request) {
  const token = getAuthToken(request);
  const decoded = verifyToken(token);

  if (decoded.role !== "ADMIN") {
    throw new HttpError(403, "Admin access required.");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true, email: true },
  });

  if (!user) {
    throw new HttpError(401, "Account no longer exists.");
  }
  if (user.role !== "ADMIN") {
    throw new HttpError(403, "Admin access required.");
  }

  return { userId: user.id, email: user.email };
}

/**
 * Verifies a regular authenticated user against the DB (existence check).
 * Throws HttpError on failure.
 */
export async function verifyUser(request: Request) {
  const token = getAuthToken(request);
  const decoded = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true, email: true },
  });

  if (!user) {
    throw new HttpError(401, "Account no longer exists.");
  }

  return user;
}