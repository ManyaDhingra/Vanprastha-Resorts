import Link from "next/link";
import { prisma } from "@/lib/server/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ChartBar } from "@/components/admin/chart-bar";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    totalRooms,
    activeRooms,
    totalUsers,
    totalRevenue,
    bookingCounts,
    recentBookings,
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
  ]);

  const byStatus = Object.fromEntries(
    bookingCounts.map((b) => [b.status, b._count._all])
  );

  // Monthly revenue (last 6 months) via SQL date_trunc — groupBy cannot
  // truncate dates. Bucketed in the resort's timezone (Asia/Kolkata) so a
  // late-night payment is attributed to the guest's calendar month, not the
  // server's UTC month.
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
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const statusCards = [
    { label: "Pending", value: stats.byStatus.PENDING ?? 0, tone: "amber" },
    { label: "Confirmed", value: stats.byStatus.CONFIRMED ?? 0, tone: "emerald" },
    { label: "Cancelled", value: stats.byStatus.CANCELLED ?? 0, tone: "red" },
  ] as const;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Total revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatINR(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {stats.activeRooms}
              <span className="ml-1 text-sm font-normal text-slate-500">
                / {stats.totalRooms} total
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statusCards.map((s) => (
                <StatusBadge key={s.label} label={s.label} value={s.value} tone={s.tone} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">
              Revenue — last 6 months
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.monthlyRevenue.length === 0 ? (
              <p className="text-sm text-slate-500">No revenue yet.</p>
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
            <CardTitle className="text-sm text-slate-600">Recent bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.recentBookings.map((b) => (
                  <li key={b.id} className="py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{b.room.title}</span>
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
                    <div className="text-xs text-slate-500">
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