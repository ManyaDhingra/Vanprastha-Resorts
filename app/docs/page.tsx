import type { Metadata } from "next";
import { SystemMap } from "@/components/docs/system-map";

export const metadata: Metadata = {
  title: "System map — Vanprastha Resorts",
  description:
    "Interactive architecture diagram: animated data flow between browser, Next.js, Prisma, PostgreSQL and Razorpay — every dot is an inspectable payload.",
};

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 pt-28 pb-16">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-normal leading-[1.15] text-text">
          System map — how data moves
        </h1>
        <p className="mt-2 text-sm text-text-muted">Architecture · data flow, not decoration</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-muted">
          Every component, every boundary, and the exact payload that crosses it.
          Pick a flow, watch the data travel, click a dot to inspect what it
          carries, click a component to see what implements it. Written
          architecture notes live in{" "}
          <a
            href="https://github.com/ManyaDhingra/Vanprastha-Resorts/blob/main/docs/ARCHITECTURE.md"
            className="text-primary underline"
          >
            docs/ARCHITECTURE.md
          </a>
          .
        </p>
      </div>

      <SystemMap />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-surface p-5 shadow-card">
          <h2 className="text-sm font-semibold text-text">Read paths</h2>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            Rooms, home, dashboard: server components query Prisma directly.
            The browser gets HTML — no client fetch round-trips, no loading
            states, DB stays the single source of truth.
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface p-5 shadow-card">
          <h2 className="text-sm font-semibold text-text">Write paths</h2>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            Every mutation is an authenticated, validated API route: Bearer JWT
            + ownership checks + central error mapping. Amounts are always
            computed server-side.
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface p-5 shadow-card">
          <h2 className="text-sm font-semibold text-text">Integrity</h2>
          <p className="mt-2 text-xs leading-relaxed text-text-muted">
            Bookings are immutable financial records (FKs RESTRICT). The
            exclusion constraint at the DB is the race backstop for
            double-booking; payment confirm is a single transaction.
          </p>
        </div>
      </div>
    </main>
  );
}
