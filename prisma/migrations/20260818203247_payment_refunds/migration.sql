-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "refundId" TEXT;

-- CreateIndex
CREATE INDEX "bookings_userId_createdAt_idx" ON "bookings"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "bookings_roomId_idx" ON "bookings"("roomId");

-- CreateIndex
CREATE INDEX "bookings_status_createdAt_idx" ON "bookings"("status", "createdAt");
