# Project Status

_Updated 2026-08-19 (deep-audit pass)._ Companion to `ARCHITECTURE.md` (how it works), `AUDIT.md` (original 3-phase remediation) and `AUDIT-2026-08-19.md` (7-auditor deep-dive: money-path races, sweep safety, auth hardening).

## What is done

### P0 — security & functional wiring (verified)
- **Auth**: HS256-pinned JWTs (secret ≥ 32 enforced), bcrypt with timing-uniform dummy-hash logins, httpOnly + SameSite=Lax cookie AND Bearer token (same token, two transports), real `/me`, logout, 7d expiry.
- **Admin authority**: every `/api/admin/*` route re-checks the role against the **DB** per request (`verifyAdmin`) — a stale JWT role claim is never trusted. Self-demotion blocked.
- **Middleware → layout gate**: security headers/CSP everywhere; `/admin` pages are gated by a server-component layout that verifies the cookie JWT on the Node runtime and re-checks `role` in the DB. (Edge cannot read `process.env.JWT_SECRET` — the old edge-side verify was dead and has been removed, finding C2.)
- **Bookings**: owner-scoped (404 for foreign ids), server-computed amounts, PENDING-only mutate/cancel, status machine `PENDING → CONFIRMED | CANCELLED`, no revival.
- **Payments**: order-bound (order id persisted before checkout), server-side order re-fetch + amount/currency/status asserts against the **live** booking amount (H1 drift closed), HMAC verify, atomic + idempotent confirmation. Missing keys → honest 503.
- **Double-booking**: partial exclusion constraint `bookings_no_overlap` (`btree_gist`, half-open `[)` range — check-out day reusable) + identical API pre-check; SQLSTATE 23P01 exclusion violations now map to 409, not 500 (C3 + C4).
- **DB**: rooms `highlights` + `isActive` (soft delete), FKs `RESTRICT` on bookings/payments, indexes.

### P1 — single source of truth
- All public read paths render from Postgres via Prisma server components (rooms browse/detail/featured/home/dashboard). Dead fetchers, mock pages, `data/rooms.ts`, fake forgot-password and stale review scaffolding removed.
- 17 rooms seeded with highlights; 26 generated images serving.
- Marketing content (`data/*`) stays static by design — editorial, not transactional.

### P2 — quality & tooling
- Vitest: 54 tests — 50 unit + 4 real-PG integration (booking math, auth, room schema, constraint incl. checkout-day reuse, **expiry sweep semantics**, errors mapping, rate-limit boundary + IP derivation, **payment-verify guard** incl. race rollback).
- E2E suite `scripts/verify-api.ps1` (reads admin credentials from env — no hardcoded defaults; all assertions real, no vacuous checks).
- `db:setup` (psql + migrate + seed), lint clean, `tsc --noEmit` clean, production build green (`output: "standalone"`).
- CI workflow (`.github/workflows/ci.yml`): lint → typecheck → migrate → seed → tests → build → e2e on push/PR.
- `.env.example` committed; `package-lock.json` tracked; duplicate deps removed (react-hook-form).

### Docs & maps
- **`/docs`** — interactive system map (animated data-flow; every dot = inspectable payload).
- `docs/ARCHITECTURE.md` — Mermaid system/sequence/ER diagrams + repository layout + integrity rules.
- `docs/STATUS.md` — this file.

## Fixes applied from the independent review (2026-08-19)

| # | Finding | Fix |
|---|---|---|
| C1 | Repo-known default admin password | Seed refuses unset/weak/default passwords; re-running seed **rotates** the admin hash; live credential rotated (see below) |
| C2 | Edge middleware could never verify tokens (no `JWT_SECRET` at edge) | Gate moved to `app/admin/layout.tsx` (Node verify + DB role re-check); middleware keeps headers + cookie-presence early exit |
| C3 | `'[]'` DB range vs exclusive pre-check → false "available" + 500 | Migration switches to half-open `'[)'`; check-out day reusable, both layers agree |
| C4 | Exclusion violations surfaced as 500 | `handleApiError` maps 23P01 / "exclusion constraint" / `no_overlap` → 409 |
| H1 | Underpayment via PUT-after-create-order | Verify asserts against the **live** booking amount; PUT clears the payment order binding when dates/amount change |
| H2 | Abandoned PENDING bookings hold inventory forever | 24h lazy expiry sweep (`lib/server/expiry.ts`) on booking/availability/admin paths + admin cancel endpoint `PATCH /api/admin/bookings/:id` + cancel button in admin UI + per-user booking throttle |
| M1 | No login brute-force guard | Fixed-window in-memory rate limiter (`lib/server/rate-limit.ts`): per-IP (30/15min) + per-account (10/15min) on login, per-user on booking creation |
| M3/L1 | bcrypt 72-byte truncation; unbounded name | Register caps password ≤ 72 chars, name ≤ 80 |
| L2 | Room images allowed arbitrary remote URLs (next/image has no remotePatterns) | Schema restricts to local `/images/` paths |
| L3 | Past-date check used UTC (rejects IST morning bookings) | Uses `Asia/Kolkata` wall-clock date |

Known, accepted debt (no live hole, documented): CSP keeps `'unsafe-inline'` because Next.js emits inline flight scripts (nonces unsupported for those in App Router); rate limiter is single-process (Redis needed for multi-instance); `verifyToken` on low-level routes doesn't re-check user existence (FK RESTRICT protects integrity; admin/user routes do check).

## What is left

### Required before a public deploy
1. **Live credentials** (already rotated locally, 2026-08-19):
   - New admin password is in `.env` (`ADMIN_PASSWORD`) — do not share; the author knows where it lives. The old default `VanprasthaAdmin2026!` no longer works (verified 401).
   - Add real **Razorpay sandbox keys** → `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` in `.env`, then run the payment e2e once with test keys (create-order/verify/HMAC path is code-verified but not live-tested — no keys).
2. **Push** the repository to origin (3 commits exist + this remediation; push needs owner approval).
3. **Deploy**: `npm ci && npm run build`, set env (DB URL, `JWT_SECRET` ≥ 32 chars, admin email/password, Razorpay keys), `npx prisma migrate deploy`, `npx prisma db seed`, `npm run start`, reverse proxy with HTTPS (cookie is `secure` in production).
4. **Post-deploy smoke**: `npm run test:e2e` against the live server.

### Recommended follow-ups (not blockers)
- **Payment sandbox e2e** once keys exist (the only unverified path end-to-end).
- **Cron/PaaS scheduler** instead of lazy expiry sweep if bookings volume grows (the sweep runs per query — fine at resort scale).
- **Redis-backed rate limiting** if the app ever runs multi-instance.
- **Refund/cancel flow for CONFIRMED bookings** (admin cancel currently rejects CONFIRMED by design).
- **Monitoring**: uptime check, Postgres backups, error alerting.
- Consider a **CMS** for marketing content if the resort team wants to edit offers/gallery without code changes (currently `data/*` is editorial code).

## Verification status (2026-08-19 deep audit)

- [x] Unit + integration tests — 54 passing (50 unit incl. payment-guard race suite + 4 real-PG)
- [x] Lint + `tsc --noEmit` clean
- [x] Production build green (`next build`, standalone output)
- [x] E2E API suite — all checks pass incl. real 307+/login assert (22 checks)
- [x] CSP + security headers verified on public pages (was homepage gap)
- [x] C3 boundary: adjacent-day booking succeeds, overlap rejected (integration test)
- [x] Expiry sweep real-PG: stale swept / live-order spared / binding-nulled swept
- [x] Admin credential rotation verified live (new works, old 401)