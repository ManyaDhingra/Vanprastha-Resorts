import { prisma } from "./prisma";

/**
 * Inventory-hold guard (H2): a PENDING booking that never moves to payment
 * must not block the room's dates forever. Each mutation-facing path runs a
 * cheap sweep first, cancelling PENDING reservations older than the TTL.
 * The sweep is lazy (no cron/job infra): the first booking/availability
 * query after a hold expires frees the slot.
 */
export const PENDING_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

export async function expireStalePendingBookings(): Promise<number> {
  const cutoff = new Date(Date.now() - PENDING_EXPIRY_MS);
  const result = await prisma.booking.updateMany({
    where: {
      status: "PENDING",
      createdAt: { lt: cutoff },
    },
    data: { status: "CANCELLED" },
  });
  return result.count;
}