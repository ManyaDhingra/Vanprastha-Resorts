"use client"

import type { Amenity } from '@/types/api'

interface Props { amenities: Amenity[] }

export function AmenitiesSection({ amenities }: Props) {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Amenities</p>
          <h2 className="font-heading text-3xl font-semibold text-slate-950">Services crafted for restoration</h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-100 bg-white p-6 shadow-card">
              <h3 className="text-lg font-semibold text-slate-900">{a.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
