import { describe, it, expect, beforeAll, vi, beforeEach } from "vitest";
import crypto from "node:crypto";
import { NextRequest } from "next/server";

/**
 * The payment-verify guard - the CRITICAL money path. Verifies the route only
 * confirms a booking that is STILL PENDING at the EXACT amount the order was
 * created against, and that a raced cancel/amount-change rolls the whole
 * confirmation back (payment row never flips to SUCCESS).
 */
const { txMock, razorpayMock } = vi.hoisted(() => ({
  txMock: {
    booking: { updateMany: vi.fn() },
    payment: { update: vi.fn() },
  },
  razorpayMock: { orders: { fetch: vi.fn() } },
}));

vi.mock("@/lib/server/prisma", () => ({
  prisma: {
    payment: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (t: typeof txMock) => unknown) => fn(txMock)),
  },
}));

vi.mock("@/lib/server/razorpay", () => ({
  getRazorpay: vi.fn(() => razorpayMock),
}));

vi.mock("@/lib/server/auth", () => ({
  verifyToken: vi.fn(() => ({ userId: "user-1", email: "a@b.co", role: "USER" })),
  getAuthToken: vi.fn(() => "token"),
}));

import { prisma } from "@/lib/server/prisma";
import { POST } from "@/app/api/payment/verify/route";

const KEY_SECRET = "test-key-secret-0123456789";
const ORDER_ID = "order_123";
const PAYMENT_ID = "pay_123";
const BOOKING_AMOUNT = 5000;

function signature() {
  return crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${ORDER_ID}|${PAYMENT_ID}`)
    .digest("hex");
}

function post() {
  return POST(
    new NextRequest("http://localhost/api/payment/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: ORDER_ID,
        razorpay_payment_id: PAYMENT_ID,
        razorpay_signature: signature(),
      }),
    })
  );
}

function seedPayment(bookingStatus = "PENDING", paymentStatus = "PENDING") {
  (prisma.payment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: "pay_1",
    bookingId: "book_1",
    status: paymentStatus,
    amount: BOOKING_AMOUNT,
    razorpayOrderId: ORDER_ID,
    booking: {
      id: "book_1",
      userId: "user-1",
      status: bookingStatus,
      totalAmount: BOOKING_AMOUNT,
    },
  });
}

beforeAll(() => {
  process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
});

beforeEach(() => {
  vi.clearAllMocks();
  seedPayment();
  razorpayMock.orders.fetch.mockResolvedValue({
    amount: BOOKING_AMOUNT * 100, // Razorpay amounts are in paise
    currency: "INR",
    status: "paid",
  });
});

describe("POST /api/payment/verify - guarded confirmation", () => {
  it("confirms when booking is PENDING at the order amount", async () => {
    txMock.booking.updateMany.mockResolvedValue({ count: 1 });
    txMock.payment.update.mockResolvedValue({ id: "pay_1" });

    const res = await post();
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    // The WHERE must carry BOTH guards: still PENDING + totalAmount equal to
    // the order-bound amount (payment.amount), never the booking's current
    // total which a concurrent PUT may have changed.
    expect(txMock.booking.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "PENDING",
          totalAmount: BOOKING_AMOUNT,
        }),
      })
    );
    expect(txMock.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "SUCCESS" }),
      })
    );
  });

  it("409 + full rollback when the guarded update matches nothing (raced cancel/amount change)", async () => {
    txMock.booking.updateMany.mockResolvedValue({ count: 0 });

    const res = await post();
    expect(res.status).toBe(409);
    // The payment update must never run: with count 0 the tx throws and the
    // payment row stays PENDING (money not marked SUCCESS on a dead booking).
    expect(txMock.payment.update).not.toHaveBeenCalled();
  });

  it("rejects when the re-fetched order amount differs from the booking amount", async () => {
    razorpayMock.orders.fetch.mockResolvedValue({
      amount: (BOOKING_AMOUNT - 1) * 100,
      currency: "INR",
      status: "paid",
    });
    const res = await post();
    expect(res.status).toBe(400);
    expect(txMock.booking.updateMany).not.toHaveBeenCalled();
  });

  it("rejects a booking cancelled mid-checkout instead of confirming it", async () => {
    seedPayment("CANCELLED");
    const res = await post();
    expect(res.status).toBe(409);
    expect(txMock.booking.updateMany).not.toHaveBeenCalled();
  });

  it("is idempotent for an already-confirmed payment", async () => {
    seedPayment("CONFIRMED", "SUCCESS");
    const res = await post();
    expect(res.status).toBe(200);
    expect((await res.json()).alreadyConfirmed).toBe(true);
    // No Razorpay call: the early return skips the order re-fetch entirely.
    expect(razorpayMock.orders.fetch).not.toHaveBeenCalled();
  });

  it("rejects an invalid signature", async () => {
    const body = JSON.stringify({
      razorpay_order_id: ORDER_ID,
      razorpay_payment_id: PAYMENT_ID,
      razorpay_signature: "forged",
    });
    const res = await POST(
      new NextRequest("http://localhost/api/payment/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      })
    );
    expect(res.status).toBe(400);
  });
});