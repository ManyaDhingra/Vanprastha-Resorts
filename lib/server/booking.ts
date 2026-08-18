import { Prisma } from "@prisma/client";
import { HttpError } from "./errors";

const DAY_MS = 1000 * 60 * 60 * 24;

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
  // rolled over. en-CA formats as YYYY-MM-DD, comparable with checkIn.
  const todayIST = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  if (checkIn < todayIST) {
    throw new HttpError(400, "Check-in date cannot be in the past.");
  }

  if (outDate <= inDate) {
    throw new HttpError(400, "Check-out date must be after check-in date.");
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