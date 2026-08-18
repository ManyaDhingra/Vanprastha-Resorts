import { describe, it, expect } from "vitest";
import {
  parseBookingDates,
  calculateNights,
  overlapWhere,
  validateGuests,
} from "@/lib/server/booking";
import { calculateNights as clientNights } from "@/lib/utils";
import { HttpError } from "@/lib/server/errors";

describe("parseBookingDates", () => {
  it("parses valid YYYY-MM-DD strings into UTC-midnight dates", () => {
    const { checkIn, checkOut } = parseBookingDates("2026-09-10", "2026-09-12");
    expect(checkIn.toISOString()).toBe("2026-09-10T00:00:00.000Z");
    expect(checkOut.toISOString()).toBe("2026-09-12T00:00:00.000Z");
  });

  it("rejects invalid or missing date strings", () => {
    expect(() => parseBookingDates("not-a-date", "2026-09-12")).toThrow(HttpError);
    expect(() => parseBookingDates("2026-09-10", "")).toThrow(HttpError);
    expect(() => parseBookingDates("2026-13-99", "2026-09-12")).toThrow(HttpError);
  });

  it("rejects past check-in dates", () => {
    const past = new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10);
    expect(() => parseBookingDates(past, "2026-12-31")).toThrow(HttpError);
  });

  it("rejects check-out on or before check-in", () => {
    expect(() => parseBookingDates("2026-09-12", "2026-09-12")).toThrow(HttpError);
    expect(() => parseBookingDates("2026-09-12", "2026-09-10")).toThrow(HttpError);
  });
});

describe("calculateNights", () => {
  it("counts whole nights exactly", () => {
    expect(
      calculateNights(new Date("2026-09-10T00:00:00Z"), new Date("2026-09-12T00:00:00Z"))
    ).toBe(2);
  });

  it("ceils partial days into full nights", () => {
    expect(
      calculateNights(new Date("2026-09-10T00:00:00Z"), new Date("2026-09-11T12:00:00Z"))
    ).toBe(2);
  });

  it("enforces a minimum of one night", () => {
    expect(
      calculateNights(new Date("2026-09-10T00:00:00Z"), new Date("2026-09-10T23:00:00Z"))
    ).toBe(1);
  });
});

describe("overlapWhere", () => {
  const w = overlapWhere("room-1", new Date("2026-09-10T00:00:00Z"), new Date("2026-09-12T00:00:00Z"));

  it("scopes to PENDING/CONFIRMED only (cancelled never blocks)", () => {
    expect(w.status).toEqual({ in: ["PENDING", "CONFIRMED"] });
  });

  it("builds the boundary-exclusive overlap predicate", () => {
    const AND = w.AND as Array<Record<string, unknown>>;
    expect(AND).toContainEqual({ checkIn: { lt: new Date("2026-09-12T00:00:00Z") } });
    expect(AND).toContainEqual({ checkOut: { gt: new Date("2026-09-10T00:00:00Z") } });
  });

  it("excludes a booking id when provided (for updates)", () => {
    const x = overlapWhere("room-1", new Date("2026-09-10"), new Date("2026-09-12"), "booking-9");
    expect(x.id).toEqual({ not: "booking-9" });
  });
});

describe("validateGuests", () => {
  it("accepts valid guest counts", () => {
    expect(validateGuests(2, 4)).toBe(2);
    expect(validateGuests(4, 4)).toBe(4);
  });

  it("rejects zero, negative and fractional values", () => {
    expect(() => validateGuests(0, 4)).toThrow(HttpError);
    expect(() => validateGuests(-1, 4)).toThrow(HttpError);
    expect(() => validateGuests(1.5, 4)).toThrow(HttpError);
    expect(() => validateGuests("2" as unknown as number, 4)).toThrow(HttpError);
  });

  it("rejects guests over room capacity", () => {
    expect(() => validateGuests(5, 4)).toThrow(HttpError);
  });
});

describe("calculateNights parity (client <> server)", () => {
  // The client version takes YYYY-MM-DD strings, the server takes Dates.
  // If these ever diverge, the guest sees a different price than the API
  // charges — this locks them together.
  const client = (a: string, b: string) => clientNights(a, b);
  const server = (a: string, b: string) =>
    calculateNights(new Date(`${a}T00:00:00.000Z`), new Date(`${b}T00:00:00.000Z`));

  const cases: [string, string, number][] = [
    ["2026-09-10", "2026-09-12", 2],
    ["2026-09-10", "2026-09-11", 1], // minimum
    ["2026-09-28", "2026-10-02", 4], // month boundary
    ["2028-02-27", "2028-03-02", 4], // leap-year boundary
    ["2026-07-31", "2026-08-02", 2], // 31-day month edge
    ["2026-12-30", "2027-01-02", 3], // year boundary
  ];

  it.each(cases)("matches across %s -> %s = %i nights", (a, b, expected) => {
    expect(client(a, b)).toBe(expected);
    expect(server(a, b)).toBe(expected);
  });
});