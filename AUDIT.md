# Vanprastha Resorts — Full Codebase Audit

Date: 2026-08-18 · Method: 4 specialist reviews (API/security, frontend, admin, data-layer) + 1 independent critical reviewer + empirical verification (`tsc --noEmit` PASS, `next build` FAIL, git history, grep verification of all critical claims).

---

## 1. Executive verdict

**This is two apps stacked in one repo with zero integration:** a static marketing-site scaffold (3 fictional rooms, fabricated testimonials, fake admin dashboards, dead nav links) and a separately-written Prisma/API/booking backend (17 real seeded rooms, real JWT auth, real Razorpay handlers) that **no frontend page consumes**.

- **Security: 1/10** — anonymous PII + payment-data dump, IDOR on all booking verbs, payment-forgery path, mock auth endpoint that accepts arbitrary tokens, fabricated admin data.
- **Correctness: 2/10** — three money flows (rooms listing, booking, admin) return 405/401; the confirmation screen fabricates success; availability lies "Available" to every visitor.
- **Maintainability: 4/10** — backend routes are clean and well-validated (best code in repo); frontend is fork-and-forget; zero tests; lockfile gitignored.
- **Production-readiness: 0/10** — cannot build on fresh clone (no `.env`/`.env.example` → `prisma generate` fails → `next build` dies); core booking flow cannot complete; admin unreachable by construction.

**Good news:** every "critical" finding is a *wiring* defect, not a design defect. Each half is internally coherent. This is a **1–2 week repair, not a rebuild** (see §8).

### Build history reconstruction (git log)
1. `d7962b9` (Jul 7) — **Initial commit**: complete frontend scaffold in one shot. 3 fictional rooms, fabricated analytics (842 users), mock API stubs. AI-generated template site.
2. `671110f` (Jul 9) — **Prisma setup**: schema + seed (17 real rooms: Yama, Ganga, Kedarnath…). Backend grafted on; frontend untouched.
3. `c87e957` (Aug 18, today) — **Implement backend APIs and authentication**: real JWT login/register, `verifyAdmin`, Razorpay create-order/verify, correct `admin/bookings` route. Only `auth-provider.tsx` was rewired. **`rooms-page.tsx`, `booking-flow.tsx`, `admin/*` pages, `availability-widget.tsx` never touched.**

Smoking gun: commit 3 built the *correct* `app/api/admin/bookings/route.ts` (verifyAdmin + clean projections) while `app/admin/bookings/page.tsx` still fetches the anonymous `/api/bookings`. The author wrote the right code in parallel and forgot to flip the consumers.

---

## 2. Architecture — every layer's reason for existence, and whether it's correct

| Layer | Exists because… | Correct? |
|---|---|---|
| `data/*.ts` (rooms/offers/testimonials/gallery/amenities/experiences) | Static-content marketing scaffold (commit 1) | ❌ Dual source of truth. `data/rooms.ts` (3 fictional, string prices, `highlights[]`) ≠ seed DB (17 real, Int prices, no highlights). Homepage + room detail read static; DB rooms visible to nobody. |
| `data/bookings.ts`, `data/users.ts` | Dead scaffold | ❌ `bookings.ts` imported by nobody. `users.ts` backs the fake `/api/auth/me` — an auth endpoint that accepts **any string** as a token. Delete. |
| `data/admin/analytics.ts` | Dashboard filler | ❌ Fabricated business numbers (842 users) rendered as real. Deceptive, delete. |
| `lib/fetchers.ts` | Wrapper over static arrays | ❌ Zero value: `fetchRooms() = return rooms`. Next 15 pages should read Prisma in Server Components, no fetch layer. |
| `lib/motion.ts` | Animation presets | ❌ Dead — 6 components inline framer-motion props. |
| `types/api.d.ts` | Describes static shapes | ❌ Lies: `capacity: string`, `pricePerNight: string` vs Prisma `Int`. `Room` lacks `slug`. tsc passes *because* the types consistently describe the fiction. |
| `app/api/bookings` + `[id]` | Real booking backend | ⚠️ Correct shape; missing authn (GET) + ownership (IDOR on all verbs). |
| `app/api/payment/*` + `lib/razorpay.ts` | Real payment backend | ⚠️ Best authz code in repo (create-order checks ownership); verify missing order↔booking binding; nothing calls them. |
| `app/api/admin/*` | Real admin backend | ✅ Most correct code in repo. Wired to nothing. |
| `app/api/rooms/route.ts` | Admin room create | ❌ POST only — GET returns 405, killing 3 consumers (rooms listing, booking flow, admin rooms). |
| `app/api/availability/route.ts` | "Availability" | ❌ Returns raw bookings to anonymous callers; ignores params; used by nobody. |
| `app/api/auth/me` | Session check | ❌ Mock: matches `'token-guest'` string, rejects real JWTs. |
| `app/api/{offers,testimonials,gallery,amenities,experiences}` | Public content API | ⚠️ Re-serve static arrays (harmless but false "APIs" — no DB behind them). |
| `app/api/auth/{login,register}` | Real auth | ⚠️ Works; no rate limiting, no email normalization, timing enumeration, no password policy. |
| `app/api/auth/forgot` | Reset flow | ❌ Mock ("reset link sent") — no token, no email. |
| `prisma/schema.prisma` + `seed.ts` | Real product data | ✅ Keep, evolve — but see §4. No admin user ever seedable; `onDelete: Cascade` wipes history. |
| Admin pages module | Admin UI | ❌ 4/8 fabricated (payments, reviews, settings, dashboard), 2 mis-wired (bookings→public leak route, users→never sends token→crash), no page-level auth gate. |
| `components/ui/{button,container}` | Design system | ✅ Used. `card.tsx` + `section-title.tsx`: dead. |
| `components/booking/booking-flow.tsx` | Booking UX | ❌ Largest lie in the app — no auth header (always 401), no `res.ok` check, fabricated confirmation screen, fake step-4 card inputs. |
| `components/rooms/availability-widget.tsx` | Availability UX | ❌ 700ms timeout → always "Available". |
| framer-motion | Motion | ✅ 6 components use it legitimately; keep. |

**Delete first (3):** `booking-flow.tsx`'s fake flow, `GET /api/bookings` anonymous dump, `data/admin/analytics.ts` fabricated numbers.
**Keep first (3):** `prisma/schema.prisma` + `seed.ts` (real product data), `app/api/admin/bookings/route.ts` (the exemplar), `app/api/payment/create-order/route.ts` (only handler with correct ownership logic).

---

## 3. Consolidated findings (deduped across 5 reviews)

### CRITICAL

| # | Finding | Location | Fix |
|---|---|---|---|
| C1 | **Anonymous PII + payment dump**: GET returns ALL bookings incl. user emails + razorpay ids/amounts, no auth. Admin bookings page consumes this exact route. | `app/api/bookings/route.ts:152-168` | Auth + scope to caller; admin page → `/api/admin/bookings` |
| C2 | **IDOR**: GET/PUT/DELETE `/api/bookings/[id]` — zero auth, no ownership check. Anyone reads/cancels/modifies anyone's booking (incl. CONFIRMED paid stays). | `app/api/bookings/[id]/route.ts` (whole file) | Require JWT + `booking.userId === decoded.userId` |
| C3 | **Payment forgery**: verify checks HMAC only — never binds order to booking, never fetches order server-side, no amount assert, no auth, not idempotent (2nd verify → P2002 → 500), confirms CANCELLED bookings, non-transactional (crash → payment SUCCESS + booking PENDING). | `app/api/payment/verify/route.ts:5-83` | Persist `razorpayOrderId` at create-order; derive booking from stored order; assert `order.amount`; `$transaction`; upsert |
| C4 | **GET /api/rooms = 405** → rooms listing, booking flow, admin rooms all dead (empty forever / "No rooms matched"). | `app/api/rooms/route.ts` | Server Component over Prisma (no route needed) |
| C5 | **Fabricated booking success**: booking-flow sends no Authorization → always 401 → client ignores `res.ok` → shows "Booking ID: undefined" confirmation. No Razorpay client integration exists. | `components/booking/booking-flow.tsx:37-48,111-129` | Attach token, check `res.ok`, real checkout.js, honest error states |
| C6 | **Admin unreachable by construction**: no page-level gate (`app/admin/layout.tsx`); pages never send token (users page → 500 → crash); register forces USER role; seed creates no users → **no admin can ever exist**; 4/8 admin pages are fabricated mocks. | admin module + `lib/admin.ts` + seed | Middleware gate, fetchWithAuth wrapper, seed bootstrap admin, delete mock pages |
| C7 | **DELETE room cascade-wipes bookings + payments** (schema `onDelete: Cascade` at booking.room AND payment.booking). | `app/api/admin/rooms/[id]/route.ts:90-92` + `schema.prisma:68-69,91-94` | Soft-delete (`isActive`) or block when bookings exist; `onDelete: Restrict` |
| C8 | **Dual source of truth**: static rooms (string ₹ prices, `highlights[]`, slug-less ids) vs DB (Int, cuid, slug). Detail page works only for static ids; DB room links → "Room not found"; admin edits invisible on public site; `booking-flow` would `TypeError` on Int prices. | `data/rooms.ts` vs `prisma/seed.ts` vs `types/api.d.ts` | DB = single source; migrate highlights; delete `data/rooms.ts` + `types/api.d.ts` (use Prisma types) |
| C9 | **26 referenced images don't exist** (room-*.svg, gallery-*.svg, experience-*.svg, `/images/rooms/*.jpg` ×17). Only hero-mountains.png (1.9MB), quote-banner.png (1.4MB), logo.svg exist. 5 header nav links → 404 pages. No favicon. | `data/*.ts`, `prisma/seed.ts`, `components/layout/site-header.tsx:15-19` | Generate/commission assets or placeholder until received; fix nav |
| C10 | **Fresh clone cannot build**: no `.env`/`.env.example` → `prisma generate` fails (`PrismaConfigEnvError: Missing required environment variable: DATABASE_URL`) → `next build` fails at page-data collection. Empirically verified. | repo root | Add `.env.example` + `postinstall: prisma generate` + boot-time env validation |

### HIGH

| # | Finding | Location |
|---|---|---|
| H1 | `verifyAdmin` throws → all 5 admin routes return **500 with leaked `error.message`** (should be 401/403; malformed "Bearer" → `jwt must be provided` leaked; Prisma P-codes leaked) | `lib/admin.ts:4-20` + all `app/api/admin/*` |
| H2 | JWT: role from claim (never re-checked in DB — demoted admin keeps ADMIN 7d), 7d expiry no revocation, localStorage (XSS-readable), expired/invalid token → 500 instead of 401 | `lib/auth.ts`, `components/auth/auth-provider.tsx:29,61-62` |
| H3 | Booking POST validation: `NaN` dates → `NaN totalAmount` → 500; negative/string guests pass; past dates accepted; totalAmount computed before validation; `Math.ceil` on POST but not PUT (fractional nights → float → 500); PUT on CONFIRMED booking changes amount | `app/api/bookings/route.ts:31-76`, `[id]/route.ts:178-184,129` |
| H4 | TOCTOU double-booking race: findFirst-then-create, no transaction, no DB overlap constraint | `app/api/bookings/route.ts:78-131` |
| H5 | `/api/availability` = anonymous raw bookings dump (userId, totals, dates), ignores params | `app/api/availability/route.ts` |
| H6 | Register: no email format check, case-sensitive duplicate detection (Foo@ vs foo@ = 2 accounts), no password policy, phone unvalidated. Login: timing-based user enumeration. No rate limiting anywhere | `app/api/auth/{register,login,forgot}/route.ts` |
| H7 | Admin rooms: POST truthiness-only validation (NaN/negative price pass); PUT zero validation (strings → 500, partial body, slug dup → P2002); mass assignment on `app/api/rooms/route.ts:15` (`prisma.room.create({data: body})`) | `app/api/admin/rooms/{route.ts,[id]/route.ts}` |
| H8 | Admin writes to DB; public site reads static files — **admin changes have zero visible effect** | fetchers + admin module |
| H9 | No error states anywhere: rooms-page no catch; booking-flow no catch (infinite "Processing…"); forgot ignores response; availability no error state | various |

### MEDIUM
- `chart-line.tsx:7` `i / (data.length - 1)` — divide-by-zero on 1 data point → NaN. `chart-bar` spread on huge arrays.
- A11y: unbound labels (rooms-filters, sort-select), mobile drawer no focus trap/Esc/scroll-lock, generic alts, no reduced-motion handling, buttons without `type`.
- Perf: 1.9MB PNG hero (LCP image; convert to AVIF), 2× `priority` images competing, ~20 "use client" components that could be server components, rooms list fetch-in-effect (no SSR).
- Reviews shown on room detail are unrelated testimonials (`testimonials.slice(0,4)`); "About this room" duplicates description.
- RoomCard shared between admin (DB shape) and public (static shape) — incompatible; `r.capacity.match()` crashes on Int.
- No loading/empty/pagination states on any admin list; `b.total` wrong field (`totalAmount`); raw ISO dates; hardcoded "Member" label.

### LOW / NIT
- `console.log("Slug:", slug)` in `rooms/[slug]/route.ts:11`
- `button.tsx:7` duplicate `'duration-300 duration-200'`
- Dead: `components/ui/card.tsx`, `ui/section-title.tsx`, `lib/motion.ts`, `data/bookings.ts`, `fetchers.createBooking`, unused import `fetchRooms` in booking-flow, unused deps `zod`, `react-hook-form`, `@hookform/resolvers`
- `.gitignore:6` ignores `package-lock.json` (no reproducibility); `dotenv` imported but not a declared dep (works transitively — fragile); no security headers/CSP; `metadataBase` points at Vercel URL; `tsconfig.node.json` decorative
- `login/route.ts` re-implements `jwt.sign` instead of `signAuthToken` (drift risk)

---

## 4. Schema critique (mandatory vs optional)

**Mandatory**
1. **Exclusion constraint** against double-booking: `EXCLUDE USING gist (room_id WITH =, tsrange("checkIn","checkOut",'[]') WITH &&)` (+ `btree_gist`). Note: a *partial* constraint (`WHERE status <> 'CANCELLED'`) has the classic Postgres hole — UPDATE moving a row INTO the set bypasses it. Clean fix: move cancelled bookings to a `booking_history` table, keep the constraint total.
2. **Payment↔order binding**: persist `razorpayOrderId` at create-order; verify looks up by stored order.
3. `Room.highlights String[]` — static rooms carry content the DB drops; migrate before deleting `data/rooms.ts`.
4. **Admin bootstrap**: seed `ADMIN_EMAIL`/`ADMIN_PASSWORD` user.
5. `Room.isActive` (soft-hide) + `onDelete: Restrict` on booking relations (C7).

**Nice-to-have:** `Booking.cancelledAt/cancelledBy`, `Payment.paidAt`, `User.lastLoginAt`. None block shipping.

## 5. Mock/real decision rule

A mock is legitimate only when it has a named real replacement and is **visibly labeled**. Test: *can anyone get from this UI to real data by editing fewer than 3 files?*
- ✅ OK: forgot-route (message says "(mock)"), marketing copy/images.
- ❌ Fail: availability widget ("Available" to everyone), admin payments/reviews/settings/dashboard (invented data rendered as real), booking confirmation (fake success).
- **Rule: mocks may live on public marketing pages; never in transactional flows (booking, payment, availability, admin).**

## 6. Untested behaviors (zero tests exist — the must-cover cases)

1. Concurrent double-booking of same room/overlapping dates (Promise.all 5× → exactly 1 succeeds)
2. Payment verify with valid signature but order amount ≠ booking amount (forgery)
3. Cross-booking signature reuse (cheap booking's order verified against expensive bookingId)
4. `GET /api/bookings` anonymous → must 401 (regression test for C1)
5. GET/PUT/DELETE `/api/bookings/:id` as another user → 403 (IDOR lock)
6. `checkOut <= checkIn`, past dates, invalid date strings, fractional-day spans, DST boundaries
7. Guests: 0, negative, non-integer, string, > capacity
8. Verify twice (idempotency), verify after cancel (must reject), create-order for already-paid booking
9. Expired/malformed/missing Authorization on every protected route → 401 (not 500)
10. Register with email case variants; duplicate-email race; brute-force login
11. Admin: no token → 401; USER token → 403; forged-role token → 403 (DB re-check); DELETE room with live bookings; room price 0/negative; slug collision
12. `GET /api/rooms` → 200 with 17 seeded rooms (405 regression)
13. Room deleted from DB while static detail cached (stale forever, no revalidation)
14. Charts with 1 data point / empty data
15. Empty DB rooms list; empty users table; session expiry mid-checkout; Razorpay modal close/cancel

## 7. Contrarian corrections (critical reviewer vs specialists)

1. **"Add GET /api/rooms" is half-right** — rooms listing should be a Server Component reading Prisma directly. The client-side fetch round-trip is the architectural smell; delete the fetch, don't build an endpoint.
2. **Don't kill `data/*.ts` wholesale, and not first** — offers/testimonials/gallery/amenities/experiences are the only copy keeping homepage sections alive; they can stay static forever. Only `data/rooms.ts` must die (after highlights migration).
3. **Serializable isolation is overkill** — a total exclusion constraint (with `booking_history` for cancelled rows) is stronger and simpler.
4. **Save the admin API surface, delete the mock pages** — the routes are the best code in the repo; the dashboard should be 3 real `prisma` count aggregates (~30 lines), not "wiring analytics APIs".
5. **1.9MB hero is the least important perf finding** — next/image re-encodes it; convert source to AVIF, move on. The real perf defect is the permanent loading spinner on a 405.
6. **`/api/auth/me` is worse than reported** — accepts any string as token; kill with `data/users.ts`.
7. **localStorage 7d JWT is defensible for USER role** on a low-sensitivity booking site. Cookie migration is textbook-overkill. Real fixes: DB role re-check per privileged call + cheap `middleware.ts` gate on `/admin/*` + short-lived token only if an admin exists.
8. **Razorpay webhook: defer** — card/UPI payments are synchronous; webhook is for settlements/refunds.

## 8. Remediation plan (3 phases)

**P0 — Security + functional wiring (1–2 days)**
Files: `app/api/bookings/route.ts` (auth GET), `bookings/[id]/route.ts` (ownership), `lib/admin.ts` (DB role check + typed errors → 401/403), `payment/verify` (order binding, amount assert, upsert, transaction), `payment/create-order` (persist orderId), delete `availability` + `auth/me` routes + `data/users.ts`, `auth-provider` (attach token), `booking-flow` (token, `res.ok`, real checkout.js, delete fake step 4), `middleware.ts` (admin gate), admin pages (fetchWithAuth; delete 4 mock pages), `.env.example` + `postinstall: prisma generate`.
Exit: anonymous callers get 401/403 on every bookings/payment/admin endpoint; booking completes end-to-end with real payment (test mode); top-10 tests green.

**P1 — Data unification (3–5 days)**
Files: schema (highlights, isActive, exclusion constraint, booking_history, Restrict, admin seed) + migration, delete `types/api.d.ts` + `lib/fetchers.ts` + `data/rooms.ts` (migrate values), rooms pages → Server Components over Prisma, admin rooms page → DB shape, 26 images (long pole — generate or placeholder), nav/favicon.
Exit: zero dead data files; public pages render only from DB or static content files; no type conflict UI↔Prisma.

**P2 — Quality (2–3 days)**
Files: Vitest + real-Postgres integration tests (`tests/api/*.test.ts`), CI workflow (lint + build + tests), security headers/CSP, un-ignore lockfile, declare `dotenv`, hero→AVIF, chart guards, delete dead components/deps, `generateStaticParams` on rooms.
Exit: CI green on lint+build+20 tests; `npm audit` clean; Lighthouse ≥ 80.

## 9. Scorecard

| Dimension | Score | Justification |
|---|---|---|
| Architecture | 3/10 | Two parallel systems, one dead half; each half internally coherent; salvageable without restructure |
| Security | 1/10 | Anonymous PII dump, IDOR on all booking verbs, payment forgery path, fake auth endpoint, fabricated admin data — but fixes are individually trivial |
| Correctness | 2/10 | Three money flows return 405/401; confirmation fabricates success; availability lies |
| Maintainability | 4/10 | Backend clean; frontend fork-and-forget; no tests; lockfile gitignored; dotenv undeclared |
| Production-readiness | 0/10 | Cannot build on fresh clone; booking impossible; admin unreachable; zero security headers. Repair = 1–2 weeks, not restart |
