-- P0 hardening: room soft-delete fields, immutable booking records,
-- double-booking exclusion constraint.

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN "highlights" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "rooms" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Bookings are financial records: never cascade-delete them.
-- Drop the cascade FKs and re-add with RESTRICT.
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_userId_fkey";
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings" DROP CONSTRAINT "bookings_roomId_fkey";
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" DROP CONSTRAINT "payments_bookingId_fkey";
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Double-booking guard: a room can have only one PENDING/CONFIRMED booking
-- per overlapping stay window. CANCELLED rows leave the indexed set, which
-- is safe because the status machine forbids reviving cancelled bookings.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap"
  EXCLUDE USING gist (
    "roomId" WITH =,
    tsrange("checkIn", "checkOut", '[]') WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED'));

-- Query support
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");
CREATE INDEX "bookings_roomId_idx" ON "bookings"("roomId");
