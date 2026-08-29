import { describe, it, expect, beforeAll, afterAll } from "vitest";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { expireStalePendingBookings, PENDING_EXPIRY_MS } from "@/lib/server/expiry";

/**
 * Real-Postgres tests for the inventory-hold sweep (H2). Covers the three
 * sweep/skip branches — including the critical one that used to be broken:
 * a booking with a live payment order in flight must NOT be cancelled under
 * the customer (Razorpay would capture money onto a cancelled booking).
 */
const prisma = new PrismaClient();
const suffix = crypto.randomBytes(4).toString("hex");

let userId = "";
let roomId = "";
const bookingIds: string[] = [];

const STALE = new Date(Date.now() - PENDING_EXPIRY_MS - 60_000); // > 24h old
const FRESH = new Date(Date.now() - 5_000);

describe("expireStalePendingBookings (real Postgres)", () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: "T-Expiry",
        email: `expiry-${suffix}@test.local`,
        password: "x",
      },
    });
    userId = user.id;
    const room = await prisma.room.create({
      data: {
        slug: `expiry-${suffix}`,
        title: "Expiry Test Room",
        category: "Test",
        block: '',
        description: "sweep verification fixture",
        capacity: 2,
        size: 100,
        pricePerNight: 1000,
        image: "/images/rooms/yama.jpg",
      },
    });
    roomId = room.id;

    const mk = async (createdAt: Date, withOrder: boolean | "nulled", day: number) => {
      const b = await prisma.booking.create({
        data: {
          userId,
          roomId,
          // distinct windows per fixture so the real exclusion constraint
          // never sees overlapping rows in the same test room
          checkIn: new Date(`2027-03-${String(day).padStart(2, "0")}T00:00:00.000Z`),
          checkOut: new Date(`2027-03-${String(day + 1).padStart(2, "0")}T00:00:00.000Z`),
          guests: 1,
          totalAmount: 1000,
          status: "PENDING",
          createdAt,
          updatedAt: createdAt,
        },
      });
      bookingIds.push(b.id);
      if (withOrder === true) {
        await prisma.payment.create({
          data: {
            bookingId: b.id,
            amount: 1000,
            status: "PENDING",
            razorpayOrderId: `order_${suffix}_${b.id}`,
          },
        });
      } else if (withOrder === "nulled") {
        // PUT clears the order binding but the payment row persists.
        await prisma.payment.create({
          data: { bookingId: b.id, amount: 1000, status: "PENDING" },
        });
      }
      return b.id;
    };

    // A: stale hold, no payment row -> swept
    await mk(STALE, false, 10);
    // B: stale hold BUT live order bound <24h ago -> spared (mid-checkout)
    await mk(STALE, true, 12);
    // C: stale hold, order binding cleared (abandoned after a PUT) -> swept
    await mk(STALE, "nulled", 14);
    // D: fresh hold -> spared
    await mk(FRESH, false, 16);
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
    await prisma.room.delete({ where: { id: roomId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("sweeps stale abandoned holds but spares fresh and in-flight ones", async () => {
    const swept = await expireStalePendingBookings();
    expect(swept).toBeGreaterThanOrEqual(2);

    const states = await prisma.booking.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, status: true },
    });
    const get = (i: number) => states.find((s) => s.id === bookingIds[i])?.status;
    expect(get(0)).toBe("CANCELLED"); // A: stale, no payment
    expect(get(1)).toBe("PENDING"); // B: live order in flight — never swept
    expect(get(2)).toBe("CANCELLED"); // C: stale, order binding nulled
    expect(get(3)).toBe("PENDING"); // D: fresh hold
  });
});