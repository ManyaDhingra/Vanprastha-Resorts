import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { HttpError, handleApiError } from "@/lib/server/errors";

/**
 * Central error-mapper behaviors. These used to be untested and two paths
 * misbehaved badly: zod failures (admin room input) and malformed JSON both
 * produced 500s instead of 400s.
 */
describe("handleApiError mapping", () => {
  const body = async (res: Response) => JSON.parse(await res.text()) as { error: string };

  it("passes HttpError status+message through", async () => {
    const res = handleApiError(new HttpError(429, "slow down"));
    expect(res.status).toBe(429);
    expect((await body(res)).error).toBe("slow down");
  });

  it("masks HttpError 500 messages", async () => {
    const res = handleApiError(new HttpError(500, "internal detail"));
    expect((await body(res)).error).toBe("Internal Server Error");
  });

  it("maps ZodError to 400 with the first issue message", async () => {
    const schema = z.object({ slug: z.string().min(2) });
    let zodError: z.ZodError;
    try {
      schema.parse({ slug: "x" });
      throw new Error("unreachable");
    } catch (e) {
      zodError = e as z.ZodError;
    }
    const res = handleApiError(zodError);
    expect(res.status).toBe(400);
    expect((await body(res)).error).toMatch(/Too small|at least|minimum/);
  });

  it("maps SyntaxError (malformed JSON) to 400", async () => {
    const res = handleApiError(new SyntaxError("Unexpected token } in JSON"));
    expect(res.status).toBe(400);
    expect((await body(res)).error).toBe("Malformed JSON body.");
  });

  it("maps P2025 (record not found) to 404", async () => {
    const err = new Prisma.PrismaClientKnownRequestError(
      "No record found for where clause",
      { code: "P2025", clientVersion: "test" }
    );
    const res = handleApiError(err);
    expect(res.status).toBe(404);
    expect((await body(res)).error).toBe("Record not found.");
  });

  it("maps P2002 overlap violations to 409 with a booking-specific message", async () => {
    const err = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["bookings_no_overlap"] },
      }
    );
    const res = handleApiError(err);
    expect(res.status).toBe(409);
    expect((await body(res)).error).toBe(
      "Room is already booked for the selected dates."
    );
  });

  it("maps 23P01 exclusion-constraint markers to 409", async () => {
    const err = new Error(
      'conflicting key value violates exclusion constraint "bookings_no_overlap"'
    );
    const res = handleApiError(err);
    expect(res.status).toBe(409);
    expect((await body(res)).error).toBe(
      "Room is already booked for the selected dates."
    );
  });

  it("masks unknown errors as 500 without leaking internals", async () => {
    const res = handleApiError(new Error("pg: connection string leaked"));
    expect(res.status).toBe(500);
    expect((await body(res)).error).toBe("Internal Server Error");
  });
});