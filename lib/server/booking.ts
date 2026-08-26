import { Prisma } from "@prisma/client";
import { HttpError } from "./errors";
import { todayIST } from "@/lib/utils";

const DAY_MS = 1000 * 60 * 60 * 24;

/** Longest stay accepted (nights). Guards totalAmount overflow and absurd holds. */
export const MAX_STAY_NIGHTS = 365;

/**
 * Parses "YYYY-MM-DD" date strings into UTC-midnight Dates.
 * Rejects invalid strings and past check-in dates.
 */
export function parseBookingDates(checkIn: string, checkOut: string) {
  if (typeof checkIn !== "string" || typeof checkOut !== "string") {
    throw new HttpError(400, "checkIn and checkOut must be dates (YYYY-MM-DD).");
  }

  const inDate = new Date(`${checkIn}T00:00:00.000Z`);
  const outDate = new Date(`${checkOut}T00:00:00.000Z`);

  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
    throw new HttpError(400, "Invalid date. Use YYYY-MM-DD.");
  }

  // "Today" in the resort's timezone (Asia/Kolkata), not UTC: a guest
  // booking their own local morning cannot be rejected because UTC already
  // rolled over. Shared helper — the client uses the same function so its
  // min-date can never drift from the server's rejection rule.
  const todayISTDate = todayIST();

  if (checkIn < todayISTDate) {
    throw new HttpError(400, "Check-in date cannot be in the past.");
  }

  if (outDate <= inDate) {
    throw new HttpError(400, "Check-out date must be after check-in date.");
  }

  if (calculateNights(inDate, outDate) > MAX_STAY_NIGHTS) {
    throw new HttpError(
      400,
      `Stays cannot exceed ${MAX_STAY_NIGHTS} nights.`
    );
  }

  return { checkIn: inDate, checkOut: outDate };
}

/**
 * Number of nights for a stay. Ceiling is used so a partial day counts as a
 * full night; a minimum of 1 night is enforced.
 */
export function calculateNights(checkIn: Date, checkOut: Date) {
  const raw = (checkOut.getTime() - checkIn.getTime()) / DAY_MS;
  return Math.max(1, Math.ceil(raw));
}

/**
 * Overlap predicate used by both the availability check and the booking
 * creation. Mirrors the DB exclusion constraint (bookings_no_overlap).
 * CANCELLED bookings never block.
 */
export function overlapWhere(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Prisma.BookingWhereInput {
  return {
    roomId,
    status: { in: ["PENDING", "CONFIRMED"] },
    AND: [
      { checkIn: { lt: checkOut } },
      { checkOut: { gt: checkIn } },
    ],
    ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
  };
}

/**
 * Guards a guests value: positive integer, within room capacity.
 */
export function validateGuests(guests: unknown, capacity: number) {
  if (!Number.isInteger(guests) || (guests as number) < 1) {
    throw new HttpError(400, "Guests must be a positive integer.");
  }
  if ((guests as number) > capacity) {
    throw new HttpError(
      400,
      `This room allows a maximum of ${capacity} guests.`
    );
  }
  return guests as number;
}