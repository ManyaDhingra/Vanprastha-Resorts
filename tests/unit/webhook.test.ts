import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";
import crypto from "node:crypto";
import { NextRequest } from "next/server";

/**
 * Razorpay webhook — the capture-without-confirm fallback (critical money
 * path #2). Verifies signature trust, guarded confirms, auto-refund on
 * cancelled bookings, amount-exactness, idempotency, and the race fallback
 * that refunds instead of stranding captured money.
 */

const { txMock, paymentsMock } = vi.hoisted(() => ({
  txMock: {
    booking: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    payment: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
  },
  paymentsMock: { refund: vi.fn().mockResolvedValue({ id: "refund_9" }) },
}));

vi.mock("@/lib/server/prisma", () => ({
  prisma: {
    payment: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: vi.fn(async (fn: (t: typeof txMock) => unknown) => fn(txMock)),
  },
}));

vi.mock("@/lib/server/razorpay", () => ({
  getRazorpay: vi.fn(() => ({ payments: paymentsMock })),
}));

import { prisma } from "@/lib/server/prisma";
import { POST } from "@/app/api/payment/webhook/route";

const WEBHOOK_SECRET = "whsec_test_0123456789abcdef";
const ORDER_ID = "order_123";
const PAYMENT_ID = "pay_123";
const AMOUNT = 5000; // rupees — stored in the DB
const PAISE = AMOUNT * 100; // what Razorpay events report

function sig(rawBody: string) {
  return crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
}

function push(event: string, entity: Record<string, unknown>, which: "payment" | "refund" = "payment") {
  const raw = JSON.stringify({ event, payload: { [which]: { entity } } });
  return POST(
    new NextRequest("http://localhost/api/payment/webhook", {
      method: "POST",
      headers: { "x-razorpay-signature": sig(raw) },
      body: raw,
    })
  );
}

function captured() {
  return { id: PAYMENT_ID, order_id: ORDER_ID, amount: PAISE, status: "captured" };
}

function seedPayment(bookingStatus = "PENDING", paymentStatus = "PENDING") {
  (prisma.payment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
    id: "pay_1",
    bookingId: "book_1",
    status: paymentStatus,
    amount: AMOUNT,
    razorpayOrderId: ORDER_ID,
    razorpayPaymentId: null,
    booking: { id: "book_1", userId: "user-1", status: bookingStatus, totalAmount: AMOUNT },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

beforeAll(() => {
  process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
});

afterAll(() => {
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

describe("signature trust", () => {
  it("503s when the webhook secret is unconfigured (loud, like the API keys)", async () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = "";
    const res = await POST(
      new NextRequest("http://localhost/api/payment/webhook", { method: "POST", body: "{}" })
    );
    expect(res.status).toBe(503);
    expect(prisma.payment.findFirst).not.toHaveBeenCalled();
  });

  it("401s on a missing signature before any DB work", async () => {
    const res = await POST(
      new NextRequest("http://localhost/api/payment/webhook", {
        method: "POST",
        body: JSON.stringify({ event: "payment.captured" }),
      })
    );
    expect(res.status).toBe(401);
    expect(prisma.payment.findFirst).not.toHaveBeenCalled();
  });

  it("401s on a forged signature", async () => {
    const raw = JSON.stringify({ event: "payment.captured", payload: {} });
    const res = await POST(
      new NextRequest("http://localhost/api/payment/webhook", {
        method: "POST",
        headers: { "x-razorpay-signature": "deadbeef".repeat(8) },
        body: raw,
      })
    );
    expect(res.status).toBe(401);
    expect(prisma.payment.findFirst).not.toHaveBeenCalled();
  });
});

describe("payment.captured", () => {
  it("confirms a still-PENDING booking with the guarded atomic update (status + amount in WHERE)", async () => {
    seedPayment("PENDING", "PENDING");
    const res = await push("payment.captured", captured());
    expect(res.status).toBe(200);

    expect(txMock.booking.updateMany).toHaveBeenCalledWith({
      where: { id: "book_1", status: "PENDING", totalAmount: AMOUNT },
      data: { status: "CONFIRMED" },
    });
    expect(txMock.payment.updateMany).toHaveBeenCalledWith({
      where: { id: "pay_1", status: "PENDING" },
      data: { status: "SUCCESS", razorpayPaymentId: PAYMENT_ID },
    });
    expect(paymentsMock.refund).not.toHaveBeenCalled();
  });

  it("refunds immediately when the booking was cancelled before capture", async () => {
    seedPayment("CANCELLED", "PENDING");
    const res = await push("payment.captured", captured());
    expect(res.status).toBe(200);

    expect(paymentsMock.refund).toHaveBeenCalledWith(PAYMENT_ID, {
      amount: PAISE,
      notes: expect.objectContaining({ bookingId: "book_1" }),
    });
    // money is out: payment REFUNDED in the DB too
    expect(prisma.payment.updateMany).toHaveBeenCalledWith({
      where: { id: "pay_1", status: "PENDING" },
      data: expect.objectContaining({ status: "REFUNDED", refundId: "refund_9" }),
    });
    expect(txMock.booking.updateMany).not.toHaveBeenCalled();
  });

  it("writes the capture when the booking is already CONFIRMED (verify ran) but the row is stale", async () => {
    seedPayment("CONFIRMED", "PENDING");
    const res = await push("payment.captured", captured());
    expect(res.status).toBe(200);
    expect(prisma.payment.updateMany).toHaveBeenCalledWith({
      where: { id: "pay_1", status: "PENDING" },
      data: { status: "SUCCESS", razorpayPaymentId: PAYMENT_ID },
    });
    expect(paymentsMock.refund).not.toHaveBeenCalled();
  });

  it("is a no-op for already-processed payments (idempotent)", async () => {
    seedPayment("CONFIRMED", "SUCCESS");
    const res = await push("payment.captured", captured());
    expect(res.status).toBe(200);
    expect(txMock.booking.updateMany).not.toHaveBeenCalled();
    expect(paymentsMock.refund).not.toHaveBeenCalled();
  });

  it("ignores captures whose amount does not match what we charged", async () => {
    seedPayment("PENDING", "PENDING");
    const res = await push("payment.captured", { ...captured(), amount: PAISE - 1 });
    expect(res.status).toBe(200);
    expect(txMock.booking.updateMany).not.toHaveBeenCalled();
    expect(paymentsMock.refund).not.toHaveBeenCalled();
  });

  it("ignores unknown order ids (never reacts to strangers)", async () => {
    (prisma.payment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await push("payment.captured", captured());
    expect(res.status).toBe(200);
    expect(txMock.booking.updateMany).not.toHaveBeenCalled();
    expect(paymentsMock.refund).not.toHaveBeenCalled();
  });

  it("refunds instead of stranding money when the guarded confirm races (booking changed)", async () => {
    seedPayment("PENDING", "PENDING");
    // the guarded guard loses: someone flipped the booking first
    (txMock.booking.updateMany as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ count: 0 });
    (prisma.payment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "pay_1",
      bookingId: "book_1",
      status: "PENDING",
      amount: AMOUNT,
      razorpayPaymentId: "pay_123",
      booking: { id: "book_1", status: "CANCELLED" },
    });

    const res = await push("payment.captured", captured());
    expect(res.status).toBe(200);
    expect(paymentsMock.refund).toHaveBeenCalledWith(PAYMENT_ID, {
      amount: PAISE,
      notes: expect.objectContaining({ source: "webhook-capture-on-cancelled" }),
    });
    expect(prisma.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "REFUNDED" }) })
    );
  });
});

describe("payment.failed", () => {
  it("marks the payment FAILED and unbinds the order so the guest can retry", async () => {
    const res = await push("payment.failed", { id: PAYMENT_ID, order_id: ORDER_ID, status: "failed" });
    expect(res.status).toBe(200);
    expect(prisma.payment.updateMany).toHaveBeenCalledWith({
      where: { razorpayOrderId: ORDER_ID, status: "PENDING" },
      data: { status: "FAILED", razorpayOrderId: null },
    });
  });
});

describe("refund.processed", () => {
  const refundEntity = () => ({ id: "refund_7", payment_id: PAYMENT_ID, amount: PAISE, status: "processed" });

  it("marks REFUNDED and releases the inventory when the refund is processed", async () => {
    seedPayment("CONFIRMED", "SUCCESS");
    const res = await push("refund.processed", refundEntity(), "refund");
    expect(res.status).toBe(200);
    expect(txMock.booking.updateMany).toHaveBeenCalledWith({
      where: { id: "book_1", status: "CONFIRMED" },
      data: { status: "CANCELLED" },
    });
    expect(txMock.payment.updateMany).toHaveBeenCalledWith({
      where: { id: "pay_1", status: "SUCCESS" },
      data: { status: "REFUNDED", refundId: "refund_7" },
    });
  });

  it("ignores partial/unknown refund amounts", async () => {
    seedPayment("CONFIRMED", "SUCCESS");
    const res = await push("refund.processed", { ...refundEntity(), amount: PAISE / 2 }, "refund");
    expect(res.status).toBe(200);
    expect(txMock.booking.updateMany).not.toHaveBeenCalled();
    expect(txMock.payment.updateMany).not.toHaveBeenCalled();
  });
});