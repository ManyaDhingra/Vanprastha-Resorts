-- C3 fix: make the exclusion range half-open [checkIn, checkOut).
-- The overlap pre-check and nights math treat the stay as nights
-- [checkIn, checkOut) — a guest checking out Oct 3 morning frees the room
-- for a check-in Oct 3. The previous '[]' (closed) range made the check-out
-- day unusable and disagreed with the API pre-check, causing false
-- "unavailable" answers and 500s on adjacent-day bookings.
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_no_overlap";

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    "roomId" WITH =,
    tsrange("checkIn", "checkOut", '[)') WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED'));