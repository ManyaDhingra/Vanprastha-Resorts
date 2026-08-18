import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/**
 * Typed HTTP error thrown by handlers/helpers.
 * Route handlers catch it and map to a clean JSON response — no internal
 * details ever reach the client.
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function isHttpError(e: unknown): e is HttpError {
  return e instanceof HttpError;
}

/**
 * Central error → response mapper. Never leaks error.message for unexpected
 * failures; Prisma constraint errors are translated (P2002 → 409 for slug
 * collisions, exclusion violations → 409 for double-booking).
 */
export function handleApiError(error: unknown) {
  if (isHttpError(error)) {
    return NextResponse.json(
      { error: error.status === 500 ? "Internal Server Error" : error.message },
      { status: error.status }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint (includes exclusion-constraint violations,
    // which Prisma surfaces as P2002 with the constraint name).
    if (error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(", ")
        : String(error.meta?.target ?? "");
      const message = target.toLowerCase().includes("overlap")
        ? "Room is already booked for the selected dates."
        : "A record with the same unique value already exists.";
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }
    if (error.code === "P2014" || error.code === "P2003") {
      return NextResponse.json(
        { error: "Operation violates a data constraint." },
        { status: 409 }
      );
    }
  }

  // Postgres exclusion-constraint violations (SQLSTATE 23P01) surface as
  // PrismaClientUnknownRequestError — code is undefined and the marker lives
  // in the message text ("conflicting key value violates exclusion constraint
  // "bookings_no_overlap""). Match defensively so the race backstop returns a
  // clean 409 instead of a generic 500.
  const message = error instanceof Error ? error.message : String(error);
  if (/exclusion constraint|23P01|no_overlap|conflicting key/i.test(message)) {
    return NextResponse.json(
      { error: "Room is already booked for the selected dates." },
      { status: 409 }
    );
  }

  console.error("[api] unhandled error:", error);
  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}

export function badRequest(message = "Invalid request.") {
  return new HttpError(400, message);
}