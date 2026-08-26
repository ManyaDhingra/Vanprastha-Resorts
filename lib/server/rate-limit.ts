/**
 * Minimal fixed-window in-memory rate limiter.
 *
 * Honest constraints: single-process only. The Next server here runs as one
 * Node process, so the Map is shared and accurate. If the app ever deploys
 * multi-instance/severless, this must be replaced with a shared store
 * (Redis/Upstash) — call sites stay the same (they only see allowed/denied).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 1000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { allowed: true };
}

/**
 * Best-effort client IP from proxy headers (behind a reverse proxy).
 * Prefers x-real-ip (set by the reverse proxy itself, not spoofable by the
 * client); falls back to the LAST x-forwarded-for entry — the leftmost value
 * is attacker-controlled when not appended by a trusted proxy, whereas the
 * rightmost is the address our own proxy recorded.
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",").pop()?.trim() ?? "unknown";
  return "unknown";
}