import { describe, it, expect, beforeAll, afterAll } from "vitest";
import crypto from "node:crypto";
import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Real-Postgres integration tests. Requires a running local Postgres with
 * migrations applied (npm run db:setup / prisma migrate deploy). Fixtures are
 * created with unique suffixes and fully cleaned up after each run.
 */
const prisma = new PrismaClient();
const suffix = crypto.randomBytes(4).toString("hex");

let userId1 = "";
let userId2 = "";
let roomId = "";

describe("bookings exclusion constraint (real Postgres)", () => {
  beforeAll(async () => {
    const u1 = await prisma.user.create({
      data: { name: "T1", email: `constraint-a-${suffix}@test.local`, password: "x" },
    });
    const u2 = await prisma.user.create({
      data: { name: "T2", email: `constraint-b-${suffix}@test.local`, password: "x" },
    });
    userId1 = u1.id;
    userId2 = u2.id;
    const room = await prisma.room.create({
      data: {
        slug: `constraint-${suffix}`,
        title: "Constraint Test Room",
        category: "Test",
        description: "room used only for exclusion-constraint verification",
        capacity: 2,
        size: 100,
        pricePerNight: 1000,
        image: "/images/rooms/yama.jpg",
      },
    });
    roomId = room.id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { roomId } });
    await prisma.room.delete({ where: { id: roomId } });
    await prisma.user.deleteMany({ where: { id: { in: [userId1, userId2] } } });
    await prisma.$disconnect();
  });

  it("rejects a second overlapping PENDING booking for the same room", async () => {
    const checkIn = new Date("2027-01-10T00:00:00.000Z");
    const checkOut = new Date("2027-01-12T00:00:00.000Z");

    await prisma.booking.create({
      data: { userId: userId1, roomId, checkIn, checkOut, guests: 1, totalAmount: 2000 },
    });

    let rejected = false;
    try {
      await prisma.booking.create({
        data: {
          userId: userId2,
          roomId,
          checkIn: new Date("2027-01-11T00:00:00.000Z"),
          checkOut: new Date("2027-01-13T00:00:00.000Z"),
          guests: 1,
          totalAmount: 2000,
        },
      });
    } catch (e) {
      // Postgres exclusion violations surface as either Known (P2002) or
      // Unknown (SQLSTATE 23P01) request errors depending on Prisma version —
      // the message marker is the reliable signal.
      const message = e instanceof Error ? e.message : String(e);
      rejected = /bookings_no_overlap|exclusion constraint|23P01/.test(message);
    }
    expect(rejected).toBe(true);
  });

  it("allows the check-out day to be reused (half-open [) range)", async () => {
    // The blocked window is Jan 10 → Jan 12. A guest checking IN Jan 12
    // (the previous guest's check-out morning) must be allowed — nights are
    // [checkIn, checkOut) and the checkout day is reusable.
    const reused = await prisma.booking.create({
      data: {
        userId: userId2,
        roomId,
        checkIn: new Date("2027-01-12T00:00:00.000Z"),
        checkOut: new Date("2027-01-13T00:00:00.000Z"),
        guests: 1,
        totalAmount: 1000,
      },
    });
    // Resolving IS the assertion: the DB would have thrown on overlap.
    expect(reused.id).toBeTruthy();
  });

  it("allows non-overlapping bookings and cancelled bookings on the same dates", async () => {
    // Non-overlapping window (next month) — must succeed.
    const later = await prisma.booking.create({
      data: {
        userId: userId2,
        roomId,
        checkIn: new Date("2027-02-01T00:00:00.000Z"),
        checkOut: new Date("2027-02-02T00:00:00.000Z"),
        guests: 1,
        totalAmount: 1000,
      },
    });
    expect(later.id).toBeTruthy();
    // CANCELLED booking overlapping the blocked window — must succeed
    // (cancelled rows leave the indexed set).
    const cancelled = await prisma.booking.create({
      data: {
        userId: userId2,
        roomId,
        checkIn: new Date("2027-01-11T00:00:00.000Z"),
        checkOut: new Date("2027-01-12T00:00:00.000Z"),
        guests: 1,
        totalAmount: 1000,
        status: "CANCELLED",
      },
    });
    expect(cancelled.id).toBeTruthy();
  });
});