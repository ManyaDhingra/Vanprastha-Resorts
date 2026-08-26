import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Admin refund — money move first, guarded local flip second. Verifies the
 * refund is only issued for CONFIRMED bookings with captured payments, that
 * a Razorpay rejection never touches local state, and that the atomic flip
 * reports the truth when a webhook raced it.
 */

const { txMock, paymentsMock } = vi.hoisted(() => ({
  txMock: {
    payment: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    booking: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
  },
  paymentsMock: { refund: vi.fn().mockResolvedValue({ id: "refund_9" }) },
}));

vi.mock("@/lib/server/prisma", () => ({
  prisma: {
    booking: { findUnique: vi.fn() },
    $transaction: vi.fn(async (fn: (t: typeof txMock) => unknown) => fn(txMock)),
  },
}));

vi.mock("@/lib/server/razorpay", () => ({
  getRazorpay: vi.fn(() => ({ payments: paymentsMock })),
}));

vi.mock("@/lib/server/admin", () => ({
  verifyAdmin: vi.fn(async () => ({ userId: "admin-1", email: "admin@vanprastha.com" })),
}));

import { prisma } from "@/lib/server/prisma";
import { POST } from "@/app/api/admin/refunds/route";

const BOOKING_ID = "book_1";
const PAYMENT_ID = "pay_1";
const AMOUNT = 5000;

function seedBooking(status: string, paymentStatus: string, paymentId: string | null = PAYMENT_ID) {
  (prisma.booking.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: BOOKING_ID,
    status,
    payment: paymentStatus
      ? { id: "pay_1", status: paymentStatus, amount: AMOUNT, razorpayPaymentId: paymentId }
      : null,
  });
}

function push(body: unknown) {
  return POST(
    new NextRequest("http://localhost/api/admin/refunds", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("guards", () => {
  it("400s without a bookingId", async () => {
    const res = await push({});
    expect(res.status).toBe(400);
    expect(prisma.booking.findUnique).not.toHaveBeenCalled();
  });

  it("404s for unknown bookings", async () => {
    (prisma.booking.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await push({ bookingId: BOOKING_ID });
    expect(res.status).toBe(404);
    expect(paymentsMock.refund).not.toHaveBeenCalled();
  });

  it("409s for bookings that are not CONFIRMED", async () => {
    seedBooking("PENDING", "PENDING");
    const res = await push({ bookingId: BOOKING_ID });
    expect(res.status).toBe(409);
    expect(paymentsMock.refund).not.toHaveBeenCalled();
  });

  it("409s when there is no captured payment (incl. already-refunded)", async () => {
    seedBooking("CONFIRMED", "REFUNDED");
    const res = await push({ bookingId: BOOKING_ID });
    expect(res.status).toBe(409);
    expect(paymentsMock.refund).not.toHaveBeenCalled();
  });

  it("409s when the payment row has no razorpay payment id", async () => {
    seedBooking("CONFIRMED", "SUCCESS", null);
    const res = await push({ bookingId: BOOKING_ID });
    expect(res.status).toBe(409);
    expect(paymentsMock.refund).not.toHaveBeenCalled();
  });
});

describe("refund execution", () => {
  it("calls Razorpay with payment_id + paise amount, then flips state atomically", async () => {
    seedBooking("CONFIRMED", "SUCCESS");
    const res = await push({ bookingId: BOOKING_ID });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, refundId: "refund_9" });

    expect(paymentsMock.refund).toHaveBeenCalledWith(PAYMENT_ID, {
      amount: AMOUNT * 100,
      notes: expect.objectContaining({ bookingId: BOOKING_ID }),
    });
    expect(txMock.payment.updateMany).toHaveBeenCalledWith({
      where: { id: "pay_1", status: "SUCCESS" },
      data: { status: "REFUNDED", refundId: "refund_9" },
    });
    expect(txMock.booking.updateMany).toHaveBeenCalledWith({
      where: { id: BOOKING_ID, status: "CONFIRMED" },
      data: { status: "CANCELLED" },
    });
  });

  it("502s when Razorpay rejects the refund — no local state changes", async () => {
    seedBooking("CONFIRMED", "SUCCESS");
    (paymentsMock.refund as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("payment not refundable"));
    const res = await push({ bookingId: BOOKING_ID });
    expect(res.status).toBe(502);
    // money move failed -> the guarded flip must never have run
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("409s when the guarded flip loses the race (webhook already processed it)", async () => {
    seedBooking("CONFIRMED", "SUCCESS");
    (txMock.payment.updateMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 0 });
    const res = await push({ bookingId: BOOKING_ID });
    expect(res.status).toBe(409);
  });
});