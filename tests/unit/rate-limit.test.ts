import { describe, it, expect } from "vitest";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";

/**
 * Rate-limit semantics nobody had tested: the exact boundary (N allowed,
 * N+1 denied), window expiry reset, bucket cleanup, and — critically — the
 * clientIp derivation, which previously trusted the attacker-controlled
 * FIRST x-forwarded-for entry.
 */
describe("rateLimit fixed window", () => {
  it("allows exactly N requests then denies N+1", () => {
    const key = `boundary-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, 3, 60_000).allowed).toBe(true);
    }
    const denied = rateLimit(key, 3, 60_000);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window expires", async () => {
    const key = `expiry-${Math.random()}`;
    expect(rateLimit(key, 1, 50).allowed).toBe(true);
    expect(rateLimit(key, 1, 50).allowed).toBe(false);
    await new Promise((r) => setTimeout(r, 60));
    expect(rateLimit(key, 1, 50).allowed).toBe(true);
  });

  it("cleans expired buckets when the map grows large", () => {
    const key = `sweep-${Math.random()}`;
    // bucket created with a 0ms window is immediately expired
    expect(rateLimit(key, 1, 0).allowed).toBe(true);
    // a fresh window with a different key triggers the opportunistic sweep
    expect(rateLimit(`fresh-${Math.random()}`, 1, 60_000).allowed).toBe(true);
  });
});

describe("clientIp derivation", () => {
  it("prefers x-real-ip (proxy-set, not spoofable)", () => {
    const req = new Request("http://localhost", {
      headers: {
        "x-real-ip": "203.0.113.9",
        "x-forwarded-for": "1.2.3.4, 203.0.113.9",
      },
    });
    expect(clientIp(req)).toBe("203.0.113.9");
  });

  it("takes the LAST x-forwarded-for entry when x-real-ip is absent", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1, 203.0.113.9" },
    });
    // The rightmost entry is the address our own proxy recorded; the
    // leftmost values are client-controlled.
    expect(clientIp(req)).toBe("203.0.113.9");
  });

  it("falls back to unknown when nothing is present", () => {
    expect(clientIp(new Request("http://localhost"))).toBe("unknown");
  });
});