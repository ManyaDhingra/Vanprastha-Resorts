# Vanprastha Resorts & Retreat

Premium mountain resort booking platform (Uttarakhand). Next.js 15 (App Router), Prisma + PostgreSQL, Razorpay payments, JWT auth.

## Stack

- **Framework:** Next.js 15.5 (App Router, server components for read paths, API routes for mutations)
- **Database:** PostgreSQL 16 (Prisma ORM; local dev via `npm run db:setup`)
- **Auth:** JWT (HS256) — httpOnly cookie for page navigation (`/admin/*` middleware gate) + Bearer header for API calls; role re-verified against the DB on every admin request
- **Payments:** Razorpay (order-bound: `razorpayOrderId` persisted server-side, verification re-fetches the order and asserts amount/currency/status)
- **Double-booking guard:** DB-level partial exclusion constraint (`bookings_no_overlap`, btree_gist) as the race backstop, mirrored by an API pre-check

## Setup

```bash
npm install
npm run db:setup     # creates local DB, applies migrations, seeds rooms + admin
cp .env.example .env # then fill in real values
npm run dev
```

Environment variables (`.env`, gitignored):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` | ≥ 32 chars; signs session tokens |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Bootstrap admin (created by seed) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payment keys. Empty = payments disabled; bookings still work and show an honest "payment unavailable" state |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client-side Razorpay key (same value) |

## Quality gates

```bash
npm run test            # vitest: unit (booking math, auth, room schema) + real-PG constraint integration
npm run test:e2e        # full API suite against a running server (auth, IDOR, overlap, payment, admin)
npm run lint            # eslint (next/core-web-vitals)
npm run build
```

## Docs & architecture

- **`/docs`** (running app) — interactive system map: animated data-flow diagram, every dot is a clickable payload, every component is inspectable
- **`docs/ARCHITECTURE.md`** — static Mermaid diagrams + integrity rules

## Architecture notes

- **DB is the single source of truth** for rooms, bookings, users, payments. Marketing content (offers, amenities, testimonials, gallery) is editorial and lives in `data/*`.
- **Bookings are immutable financial records**: FKs are `RESTRICT` — rooms with booking history can only be deactivated, never deleted; users with bookings can never be deleted.
- **Status machine**: `PENDING → CONFIRMED | CANCELLED`. Users can only modify/cancel `PENDING` bookings; cancelled bookings can never be revived (which is what makes the partial exclusion constraint sound).
- **Payments**: order created only for the caller's own `PENDING` booking; verify derives the booking from the stored order id (client can't point a cheap order at an expensive booking), re-fetches the order server-side, HMAC-checks the signature, and flips payment→SUCCESS + booking→CONFIRMED in one transaction (idempotent).
