"use client"

import * as React from 'react'

export default function AdminBookings() {
  const [bookings, setBookings] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch('/api/bookings').then((r) => r.json()).then(setBookings)
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Bookings</h1>
      </div>

      <div className="grid gap-4">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">{b.id}</div>
                <div className="text-xs text-slate-600">{b.checkIn} → {b.checkOut} • {b.guests} guests</div>
              </div>
              <div className="text-sm text-slate-700">{b.total}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
