import Razorpay from "razorpay";
import { HttpError } from "./errors";

let instance: Razorpay | null = null;

/**
 * Lazy singleton: the Razorpay client is only constructed when a payment is
 * actually attempted. Missing keys never break imports/builds — payment
 * routes call this and surface a clear 503 instead.
 */
export function getRazorpay(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new HttpError(
      503,
      "Payments are not configured. Contact support."
    );
  }

  if (!instance) {
    instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return instance;
}

export function isPaymentsConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}