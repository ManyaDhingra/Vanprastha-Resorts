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
      // Keyed on updatedAt, not createdAt: any guest activity (PUT edit)
      // resets the hold clock, so an old hold that's being actively worked
      // is never swept mid-flow.
      updatedAt: { lt: cutoff },
      // A booking with a LIVE payment order is mid-checkout — sweeping it
      // would let Razorpay capture money onto a cancelled booking (no refund
      // path). Three cases are sweepable:
      //  - no payment row at all (classic abandoned hold)
      //  - payment row whose order binding was cleared by a PUT (abandoned)
      //  - payment row old enough that its order is certainly dead
      //    (Razorpay checkout windows are minutes, not days)
      AND: [
        {
          OR: [
            { payment: { is: null } },
            { payment: { razorpayOrderId: null } },
            { payment: { updatedAt: { lt: cutoff } } },
          ],
        },
      ],
    },
    data: { status: "CANCELLED" },
  });
  return result.count;
}