import Link from "next/link";
import { prisma } from "@/lib/server/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ChartBar } from "@/components/admin/chart-bar";
import { formatINR, todayIST } from "@/lib/utils";
import { CalendarCheck, CalendarX, BedDouble, Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  // todayIST() returns "YYYY-MM-DD" but Prisma needs Date objects for
  // DateTime comparisons.  We build startOfToday / startOfTomorrow as
  // Date objects representing the IST boundaries, then convert to UTC
  // ISO strings which Prisma accepts.
  const todayStr = todayIST(); // e.g. "2026-08-29"
  const startOfToday = new Date(`${todayStr}T00:00:00.000Z`);
  const startOfTomorrow = new Date(`${todayStr}T00:00:00.000Z`);
  startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);

  const [
    totalRooms,
    activeRooms,
    totalUsers,
    totalRevenue,
    bookingCounts,
    recentBookings,
    todayCheckIns,
    todayCheckOuts,
    occupiedToday,
    upcomingBookings,
  ] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        room: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    // Today's check-ins: checkIn falls on today's date (>= startOfToday, < startOfTomorrow)
    prisma.booking.findMany({
      where: {
        checkIn: { gte: startOfToday, lt: startOfTomorrow },
        status: { not: "CANCELLED" },
      },
      include: {
        room: { select: { title: true, block: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Today's check-outs: checkOut falls on today's date
    prisma.booking.findMany({
      where: {
        checkOut: { gte: startOfToday, lt: startOfTomorrow },
        status: { not: "CANCELLED" },
      },
      include: {
        room: { select: { title: true, block: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    // Occupied today: any confirmed booking whose stay overlaps today
    // (checkIn < startOfTomorrow AND checkOut > startOfToday)
    prisma.booking.count({
      where: {
        status: "CONFIRMED",
        checkIn: { lt: startOfTomorrow },
        checkOut: { gt: startOfToday },
      },
    }),
    // Upcoming bookings: check-in is strictly after today
    prisma.booking.count({
      where: {
        checkIn: { gte: startOfTomorrow },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
    }),
  ]);

  const byStatus = Object.fromEntries(
    bookingCounts.map((b) => [b.status, b._count._all])
  );

  const monthlyRows = await prisma.$queryRaw<
    Array<{ month: Date; total: bigint }>
  >`
    SELECT date_trunc('month', "createdAt" AT TIME ZONE 'Asia/Kolkata') AS month, SUM(amount) AS total
    FROM payments
    WHERE status = 'SUCCESS'
    GROUP BY date_trunc('month', "createdAt" AT TIME ZONE 'Asia/Kolkata')
    ORDER BY month DESC
    LIMIT 6
  `;

  const monthlyRevenue = monthlyRows.map((r) => ({
    month: new Date(r.month).toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    }),
    total: Number(r.total),
  }));

  return {
    totalRooms,
    activeRooms,
    totalUsers,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    byStatus,
    monthlyRevenue,
    recentBookings,
    todayCheckIns,
    todayCheckOuts,
    occupiedToday,
    availableToday: activeRooms - occupiedToday,
    upcomingBookings,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-text-muted">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* Today's Operations */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-text-muted">
              <CalendarCheck className="h-4 w-4" />
              Today&apos;s Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.todayCheckIns.length}</p>
            {stats.todayCheckIns.length > 0 && (
              <ul className="mt-2 space-y-1">
                {stats.todayCheckIns.slice(0, 3).map((b) => (
                  <li key={b.id} className="text-xs text-text-muted">
                    {b.user.name} — {b.room.title}
                  </li>
                ))}
                {stats.todayCheckIns.length > 3 && (
                  <li className="text-xs text-primary">+{stats.todayCheckIns.length - 3} more</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-text-muted">
              <CalendarX className="h-4 w-4" />
              Today&apos;s Check-outs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.todayCheckOuts.length}</p>
            {stats.todayCheckOuts.length > 0 && (
              <ul className="mt-2 space-y-1">
                {stats.todayCheckOuts.slice(0, 3).map((b) => (
                  <li key={b.id} className="text-xs text-text-muted">
                    {b.user.name} — {b.room.title}
                  </li>
                ))}
                {stats.todayCheckOuts.length > 3 && (
                  <li className="text-xs text-primary">+{stats.todayCheckOuts.length - 3} more</li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-text-muted">
              <BedDouble className="h-4 w-4" />
              Available Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {stats.availableToday}
              <span className="ml-1 text-sm font-normal text-text-muted">
                / {stats.activeRooms} rooms
              </span>
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {stats.occupiedToday} occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-text-muted">
              <Users className="h-4 w-4" />
              Upcoming Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.upcomingBookings}</p>
            <p className="mt-1 text-xs text-text-muted">
              Future confirmed &amp; pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatINR(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label="Pending" value={stats.byStatus.PENDING ?? 0} tone="amber" />
              <StatusBadge label="Confirmed" value={stats.byStatus.CONFIRMED ?? 0} tone="emerald" />
              <StatusBadge label="Cancelled" value={stats.byStatus.CANCELLED ?? 0} tone="red" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {stats.activeRooms}
              <span className="ml-1 text-sm font-normal text-text-muted">
                active / {stats.totalRooms} total
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">
              Revenue — last 6 months
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.monthlyRevenue.length === 0 ? (
              <p className="text-sm text-text-muted">No revenue yet.</p>
            ) : (
              <ChartBar
                data={stats.monthlyRevenue.map((m) => ({ label: m.month, value: m.total }))}
                height={160}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-text-muted">Recent bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length === 0 ? (
              <p className="text-sm text-text-muted">No bookings yet.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {stats.recentBookings.map((b) => (
                  <li key={b.id} className="py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <Link href={`/admin/bookings/${b.id}`} className="font-medium hover:underline">
                        {b.room.title}
                      </Link>
                      <span
                        className={
                          b.status === "CONFIRMED"
                            ? "text-emerald-700"
                            : b.status === "CANCELLED"
                              ? "text-red-600"
                              : "text-amber-700"
                        }
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted">
                      {b.user.name} · {b.checkIn.toLocaleDateString()} →{" "}
                      {b.checkOut.toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <Link
                href="/admin/bookings"
                className="text-sm text-primary underline"
              >
                View all bookings →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
