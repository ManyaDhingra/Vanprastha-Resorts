"use client"

import { adminAnalytics } from '@/data/admin/analytics'
import { LineChart } from '@/components/admin/chart-line'

export default function AdminAnalytics() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Analytics</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-card">
          <h3 className="text-sm text-slate-700">Revenue trend</h3>
          <LineChart data={adminAnalytics.revenue} />
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-card">
          <h3 className="text-sm text-slate-700">Bookings trend</h3>
          <LineChart data={adminAnalytics.bookings} />
        </div>
      </div>
    </div>
  )
}
