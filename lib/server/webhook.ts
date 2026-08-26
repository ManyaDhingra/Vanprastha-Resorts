import crypto from "crypto";
import { HttpError } from "./errors";

/**
 * Razorpay webhook verification. The webhook secret is a separate credential
 * from the API keys (configured on the Razorpay dashboard); both must be set
 * for server-to-server events to be trusted.
 */
export function getWebhookSecret(): string {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new HttpError(503, "Webhooks are not configured.");
  }
  return secret;
}

/**
 * Razorpay signs the RAW request body with HMAC-SHA256 and sends the digest
 * in the x-razorpay-signature header. The signature must be computed over the
 * exact bytes received — any JSON re-serialization on our side would break
 * (and mask) it, so callers pass the raw text.
 */
export function verifyRazorpaySignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}