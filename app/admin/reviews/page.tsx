"use client"

import * as React from 'react'

export default function AdminReviews() {
  const reviews = [
    { id: 'r1', guest: 'Anika Singh', quote: 'Quiet, restorative stay.' },
    { id: 'r2', guest: 'Simon Meyer', quote: 'Breathtaking views and attentive service.' }
  ]

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Reviews</h1>
      </div>

      <div className="grid gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-card">
            <div className="text-sm text-slate-700">“{r.quote}”</div>
            <div className="mt-2 text-xs text-slate-500">— {r.guest}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
