"use client"

import { Card } from '@/components/ui/card'
import { LineChart } from '@/components/admin/chart-line'
import { BarChart } from '@/components/admin/chart-bar'
import { adminAnalytics } from '@/data/admin/analytics'

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm text-slate-600">Rooms available</div>
          <div className="mt-2 text-2xl font-semibold">{adminAnalytics.roomsAvailable}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-slate-600">Active bookings (last 7 days)</div>
          <div className="mt-2 text-2xl font-semibold">{adminAnalytics.bookings.reduce((a,b)=>a+b,0)}</div>
        </Card>

        <Card className="p-6">
          <div className="text-sm text-slate-600">Total users</div>
          <div className="mt-2 text-2xl font-semibold">{adminAnalytics.totalUsers}</div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-700">Revenue (last 7 days)</h3>
          <LineChart data={adminAnalytics.revenue} />
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-700">Bookings</h3>
          <BarChart data={adminAnalytics.bookings} />
        </Card>
      </div>
    </div>
  )
}
