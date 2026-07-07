"use client"

import * as React from 'react'
import type { Testimonial } from '@/types/api'

export function RoomReviews({ reviews }: { reviews: Testimonial[] }) {
  return (
    <div>
      <h4 className="mb-4 text-lg font-semibold text-slate-900">Guest reviews</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        {reviews.map((r) => (
          <blockquote key={r.id} className="rounded-lg border border-slate-100 bg-white p-4 text-sm shadow-card">
            <p>“{r.quote}”</p>
            <footer className="mt-3 text-xs text-slate-500">— {r.guest}, {r.location}</footer>
          </blockquote>
        ))}
      </div>
    </div>
  )
}
