/**
 * System map data for the interactive architecture diagram (/docs).
 * Nodes are system components; flows are the actual data paths through the
 * app — each step carries the real payload that moves between components.
 * The renderer animates dots along these paths; clicking a dot or node
 * inspects the data snippet.
 */

export type NodeTone =
  | "browser"
  | "edge"
  | "app"
  | "service"
  | "data"
  | "external";

export interface MapNode {
  id: string;
  label: string;
  subtitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: NodeTone;
  description: string;
  files: string[];
}

export interface FlowStep {
  from: string;
  to: string;
  label: string;
  note: string;
  request: string;
  response: string;
}

export interface DataFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
}

export const MAP_WIDTH = 1200;
export const MAP_HEIGHT = 820;

export const systemNodes: MapNode[] = [
  {
    id: "browser",
    label: "Browser",
    subtitle: "React client · localStorage JWT",
    x: 40,
    y: 90,
    w: 230,
    h: 120,
    tone: "browser",
    description:
      "Renders server components plus client widgets (booking wizard, profile, admin tables). Holds the JWT in localStorage for Bearer calls and relies on the httpOnly cookie for page navigation.",
    files: [
      "app/layout.tsx",
      "components/booking/booking-flow.tsx",
      "components/auth/auth-provider.tsx",
      "lib/utils.ts (apiFetch)",
    ],
  },
  {
    id: "middleware",
    label: "Edge Middleware",
    subtitle: "Page gate + security headers",
    x: 340,
    y: 40,
    w: 220,
    h: 100,
    tone: "edge",
    description:
      "Presence-gates /admin/* (redirects to /login when the vp_token cookie is absent) and sets CSP, X-Frame-Options, nosniff, referrer & permissions-policy headers on every response. JWT verification happens in the Node runtime (app/admin/layout.tsx + API routes) — jsonwebtoken cannot run on Edge.",
    files: ["middleware.ts"],
  },
  {
    id: "server-components",
    label: "Server Components",
    subtitle: "Read paths over Prisma",
    x: 340,
    y: 190,
    w: 220,
    h: 100,
    tone: "app",
    description:
      "Rooms browse/detail, homepage featured rooms and the admin dashboard query the DB directly — no client fetch round-trips. Rooms are the single source of truth; marketing content is static (data/*).",
    files: [
      "app/rooms/page.tsx",
      "app/rooms/[slug]/page.tsx",
      "app/admin/page.tsx",
    ],
  },
  {
    id: "api-routes",
    label: "API Routes",
    subtitle: "Mutations, auth'd + validated",
    x: 630,
    y: 40,
    w: 250,
    h: 110,
    tone: "app",
    description:
      "Route handlers for auth, bookings, payments, availability and admin. Every route validates input (zod / typed helpers), maps errors centrally (HttpError → handleApiError) and never leaks internals.",
    files: [
      "app/api/auth/*",
      "app/api/bookings/*",
      "app/api/payment/*",
      "app/api/admin/*",
      "app/api/rooms/route.ts",
      "app/api/availability/route.ts",
      "lib/server/errors.ts",
    ],
  },
  {
    id: "auth-core",
    label: "Auth Core",
    subtitle: "JWT HS256 · bcrypt · cookies",
    x: 630,
    y: 200,
    w: 250,
    h: 100,
    tone: "service",
    description:
      "Signs/verifies HS256 JWTs (algorithm pinned, secret ≥ 32 chars), compares passwords with bcrypt against a dummy hash when the email is unknown (timing guard), normalizes emails, and sets/clears the httpOnly session cookie. Admin routes re-check the role against the DB on every request.",
    files: [
      "lib/server/auth.ts",
      "lib/server/admin.ts",
      "app/api/auth/login/route.ts",
      "app/api/auth/register/route.ts",
    ],
  },
  {
    id: "booking-core",
    label: "Booking Domain",
    subtitle: "Dates · nights · overlap · status",
    x: 630,
    y: 350,
    w: 250,
    h: 110,
    tone: "service",
    description:
      "Parses YYYY-MM-DD dates to UTC midnight (past dates rejected), computes nights with ceiling, validates guests against capacity, and builds the overlap predicate. The status machine only allows PENDING → CONFIRMED | CANCELLED; cancelled bookings can never be revived.",
    files: [
      "lib/server/booking.ts",
      "app/api/bookings/route.ts",
      "app/api/bookings/[id]/route.ts",
      "app/api/availability/route.ts",
    ],
  },
  {
    id: "payment-core",
    label: "Payment Core",
    subtitle: "Order binding · HMAC · tx",
    x: 630,
    y: 510,
    w: 250,
    h: 110,
    tone: "service",
    description:
      "Creates Razorpay orders only for the caller's own PENDING booking and persists the order id before checkout. Verification derives the booking from the STORED order id (never the client), re-fetches the order server-side, asserts amount/currency/status, HMAC-checks the signature, then flips payment SUCCESS + booking CONFIRMED atomically. Idempotent re-verify.",
    files: [
      "lib/server/razorpay.ts",
      "app/api/payment/create-order/route.ts",
      "app/api/payment/verify/route.ts",
    ],
  },
  {
    id: "prisma",
    label: "Prisma Client",
    subtitle: "Typed queries · transactions",
    x: 950,
    y: 200,
    w: 210,
    h: 90,
    tone: "data",
    description:
      "Generated type-safe client over PostgreSQL. $transaction used for payment confirm; upserts for idempotent seed; aggregates via SQL for the dashboard.",
    files: ["lib/server/prisma.ts", "prisma/schema.prisma"],
  },
  {
    id: "postgres",
    label: "PostgreSQL 16",
    subtitle: "Single source of truth",
    x: 950,
    y: 350,
    w: 210,
    h: 160,
    tone: "data",
    description:
      "users, rooms, bookings, payments. Bookings are immutable financial records: FKs RESTRICT deletion. The partial exclusion constraint bookings_no_overlap (btree_gist on roomId + tsrange) is the race-proof double-booking backstop; CANCELLED rows leave the indexed set so dates free up immediately.",
    files: [
      "prisma/migrations/20260818_p0_hardening/migration.sql",
      "prisma/seed.ts",
    ],
  },
  {
    id: "razorpay",
    label: "Razorpay",
    subtitle: "External checkout",
    x: 40,
    y: 380,
    w: 230,
    h: 110,
    tone: "external",
    description:
      "Order API + hosted checkout (checkout.js). Keys come from env; without keys the app returns an honest 503 and the booking flow shows a clear 'payment unavailable' state instead of pretending.",
    files: ["lib/server/razorpay.ts", ".env.example"],
  },
  {
    id: "seed",
    label: "Seed & Admin",
    subtitle: "Idempotent bootstrap",
    x: 950,
    y: 40,
    w: 210,
    h: 90,
    tone: "external",
    description:
      "Upserts 17 rooms with highlights and creates the bootstrap ADMIN from ADMIN_EMAIL/ADMIN_PASSWORD (bcrypt-hashed). Safe to re-run: updates apply, no duplicates.",
    files: ["prisma/seed.ts", "scripts/db-setup.ps1"],
  },
];

export const systemFlows: DataFlow[] = [
  {
    id: "auth",
    name: "1 · Register / Login",
    description:
      "Account creation and session issuance — bcrypt + JWT, dual transport (cookie for pages, Bearer for APIs), then session validation on page load.",
    steps: [
      {
        from: "browser",
        to: "api-routes",
        label: "POST /api/auth/register",
        note: "Public route. Input validated before any DB work.",
        request: `{
  "name": "Anika Singh",
  "email": "anika@example.com",
  "password": "••••••••",
  "phone": "+91 98…"
}`,
        response: `201 Created`,
      },
      {
        from: "api-routes",
        to: "auth-core",
        label: "normalize + hash",
        note: "Email lowercased & format-checked; password ≥ 8 chars; bcrypt cost 10. Unknown-email logins compare against a dummy hash to keep timing uniform.",
        request: `email → anika@example.com
password → bcrypt.hash(pw, 10)`,
        response: `passwordHash: "$2b$10$…"`,
      },
      {
        from: "auth-core",
        to: "prisma",
        label: "INSERT users",
        note: "Duplicate email → 409 (unique constraint on users.email).",
        request: `prisma.user.create({
  data: { name, email, password: hash, phone }
})`,
        response: `{ id: "cmsy…", role: "USER" }`,
      },
      {
        from: "prisma",
        to: "postgres",
        label: "INSERT INTO users",
        note: "users table, role defaults to USER.",
        request: `INSERT INTO users (id, name, email, password, role)
VALUES (…, 'USER')`,
        response: `1 row`,
      },
      {
        from: "auth-core",
        to: "browser",
        label: "201 { token, user } + Set-Cookie",
        note: "JWT (HS256, 7d) returned in body AND set as httpOnly vp_token cookie — same token, two transports.",
        request: `signAuthToken({ id, email, role })`,
        response: `{
  "token": "eyJhbGciOiJIUzI1NiJ9…",
  "user": { "id": "cmsy…", "name": "Anika Singh", "role": "USER" }
}
Set-Cookie: vp_token=…; HttpOnly; SameSite=Lax; Path=/`,
      },
    ],
  },
  {
    id: "browse",
    name: "2 · Browse rooms",
    description:
      "Read path: server components query the DB directly — the browser receives HTML, never raw data-fetching code. Single source of truth: rooms table.",
    steps: [
      {
        from: "browser",
        to: "server-components",
        label: "GET /rooms",
        note: "Plain page navigation — no client fetch, no loading spinners.",
        request: `GET /rooms → <RoomCard/> grid`,
        response: `HTML (server-rendered)`,
      },
      {
        from: "server-components",
        to: "prisma",
        label: "findMany(isActive)",
        note: "Only active rooms; ordered by price. The booking wizard separately calls GET /api/rooms for the client-side room picker.",
        request: `prisma.room.findMany({
  where: { isActive: true },
  orderBy: { pricePerNight: "asc" }
})`,
        response: `17 rooms`,
      },
      {
        from: "prisma",
        to: "postgres",
        label: "SELECT * FROM rooms",
        note: "rooms table: slug unique, pricePerNight Int, highlights TEXT[], isActive Boolean.",
        request: `SELECT id, slug, title, pricePerNight, highlights
FROM rooms WHERE "isActive" = true
ORDER BY "pricePerNight" ASC`,
        response: `yama · 12000 · [valley view, …]
ganga · 18000 · [4 beds, …]`,
      },
    ],
  },
  {
    id: "booking",
    name: "3 · Create booking",
    description:
      "The critical write path: ownership enforced, amount computed server-side, overlap rejected twice (API pre-check + DB exclusion constraint as the race backstop).",
    steps: [
      {
        from: "browser",
        to: "api-routes",
        label: "POST /api/bookings",
        note: "Requires Authorization: Bearer <JWT>. Amount comes from the server — the client can never set the price.",
        request: `{
  "roomId": "cmsyvy4ci…",
  "checkIn": "2026-09-10",
  "checkOut": "2026-09-12",
  "guests": 2
}`,
        response: `201 Created`,
      },
      {
        from: "api-routes",
        to: "auth-core",
        label: "verifyToken()",
        note: "Alg pinned to HS256; expired/invalid → 401. The decoded userId scopes every query below.",
        request: `Bearer eyJhbGciOiJIUzI1NiJ9…`,
        response: `{ userId: "cmsy…", role: "USER" }`,
      },
      {
        from: "api-routes",
        to: "booking-core",
        label: "validate dates/guests/nights",
        note: "UTC-midnight parsing, past dates rejected, nights = ceil(days) ≥ 1, guests ≤ room.capacity. Amount = nights × pricePerNight.",
        request: `parseBookingDates("2026-09-10","2026-09-12")
validateGuests(2, capacity=3)
nights = 2 → total = 2 × 12000`,
        response: `totalAmount: 24000`,
      },
      {
        from: "booking-core",
        to: "prisma",
        label: "overlap pre-check",
        note: "Friendly 409 before inserting. The DB constraint is the real guard against concurrent double-booking races.",
        request: `findFirst(overlapWhere(
  roomId, in, out
)) — PENDING/CONFIRMED only`,
        response: `null → proceed (or 409)`,
      },
      {
        from: "booking-core",
        to: "prisma",
        label: "INSERT booking (PENDING)",
        note: "Exclusion constraint re-validates at insert — concurrent requests racing past the pre-check still cannot double-book.",
        request: `prisma.booking.create({
  data: { userId, roomId, checkIn, checkOut,
          guests, totalAmount, status: "PENDING" }
})`,
        response: `201 { id: "cmsywya1j…", totalAmount: 24000 }`,
      },
      {
        from: "prisma",
        to: "postgres",
        label: "INSERT + constraint check",
        note: "btree_gist exclusion on (roomId, tsrange(checkIn, checkOut, '[)')) WHERE status IN ('PENDING','CONFIRMED'). Half-open: the check-out day is reusable. CANCELLED rows don't block.",
        request: `INSERT INTO bookings …`,
        response: `✓ or: conflicting key value violates
exclusion constraint "bookings_no_overlap" → 409`,
      },
    ],
  },
  {
    id: "payment",
    name: "4 · Payment",
    description:
      "Order-bound Razorpay flow: order id persisted BEFORE checkout so verification can never be pointed at a different booking; server-side order fetch + amount assert + HMAC + atomic confirm.",
    steps: [
      {
        from: "browser",
        to: "api-routes",
        label: "POST /api/payment/create-order",
        note: "Bearer auth; only the caller's own PENDING booking; keys missing → honest 503.",
        request: `{ "bookingId": "cmsywya1j…" }`,
        response: `{ orderId, amount: 240000, currency: "INR" }`,
      },
      {
        from: "api-routes",
        to: "payment-core",
        label: "razorpay.orders.create",
        note: "Amount in paise; receipt = booking id; order id is UPSERTED onto the payment row before checkout opens.",
        request: `orders.create({
  amount: 240000, currency: "INR",
  receipt: "cmsywya1j…"
})`,
        response: `order_MxX…`,
      },
      {
        from: "payment-core",
        to: "razorpay",
        label: "POST /orders (external)",
        note: "Razorpay's API — the only external dependency in the write path.",
        request: `{ amount, currency, receipt }`,
        response: `{ id: "order_MxX…", status: "created" }`,
      },
      {
        from: "browser",
        to: "razorpay",
        label: "checkout.js modal",
        note: "User pays in Razorpay's hosted flow. Handler returns order_id, payment_id, signature.",
        request: `new Razorpay({ order_id: "order_MxX…" }).open()`,
        response: `{
  razorpay_order_id: "order_MxX…",
  razorpay_payment_id: "pay_…",
  razorpay_signature: "hmac…"
}`,
      },
      {
        from: "browser",
        to: "api-routes",
        label: "POST /api/payment/verify",
        note: "Booking is derived from the STORED order id — a signature from a cheap order can never confirm an expensive booking.",
        request: `{ razorpay_order_id, razorpay_payment_id,
  razorpay_signature }`,
        response: `{ success: true }`,
      },
      {
        from: "api-routes",
        to: "payment-core",
        label: "orders.fetch + HMAC",
        note: "Order re-fetched server-side: amount must equal payment.amount×100, currency INR, status paid. Then HMAC(order|payment) verified with key secret.",
        request: `orders.fetch("order_MxX…")
assert(amount == 240000 && currency == "INR")
HMAC-SHA256(order_id|payment_id)`,
        response: `all checks pass`,
      },
      {
        from: "payment-core",
        to: "postgres",
        label: "$transaction confirm",
        note: "Atomic: payment → SUCCESS + booking → CONFIRMED. Re-verify is idempotent (same success, no state flip).",
        request: `prisma.$transaction([
  payment.update({ status: "SUCCESS" }),
  booking.update({ status: "CONFIRMED" })
])`,
        response: `✓ committed`,
      },
    ],
  },
  {
    id: "admin",
    name: "5 · Admin",
    description:
      "Two gates: middleware cookie check for page access, and a DB role re-check (not just the JWT claim) on every admin API call. Dashboard aggregates come from server components.",
    steps: [
      {
        from: "browser",
        to: "middleware",
        label: "GET /admin",
        note: "Page navigation carries no Authorization header — the httpOnly vp_token cookie is verified with Web Crypto on Edge. No cookie / invalid → 307 /login.",
        request: `Cookie: vp_token=eyJhbGciOiJIUzI1NiJ9…`,
        response: `✓ role ADMIN → pass`,
      },
      {
        from: "middleware",
        to: "server-components",
        label: "dashboard (SSR)",
        note: "Admin dashboard queries prisma directly: counts, revenue sum, monthly revenue via date_trunc SQL.",
        request: `prisma.payment.aggregate({ _sum: amount })
prisma.booking.groupBy(status)
SELECT date_trunc('month', …) …`,
        response: `HTML with real numbers`,
      },
      {
        from: "browser",
        to: "api-routes",
        label: "GET /api/admin/bookings",
        note: "Bearer token + DB role re-check: a demoted admin with a stale USER token gets 403 immediately.",
        request: `Authorization: Bearer <admin JWT>`,
        response: `[{ id, room, user, payment, status }]`,
      },
      {
        from: "api-routes",
        to: "prisma",
        label: "verifyAdmin → queries",
        note: "No error.message leaks: handleApiError maps failures to safe JSON (P2002 → 409, internals → 500).",
        request: `verifyAdmin() → findMany(booking,
  include room/user/payment)`,
        response: `200 OK`,
      },
    ],
  },
];

export function getNode(id: string): MapNode | undefined {
  return systemNodes.find((n) => n.id === id);
}