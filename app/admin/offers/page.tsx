"use client"

import * as React from 'react'

export default function AdminOffers() {
  const [offers, setOffers] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch('/api/offers').then((r) => r.json()).then(setOffers)
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Offers</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => (
          <div key={o.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="text-sm font-medium text-slate-900">{o.title}</div>
            <div className="mt-1 text-xs text-slate-600">{o.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
