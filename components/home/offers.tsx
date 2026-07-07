"use client"

import { Button } from '@/components/ui/button'
import type { Offer } from '@/types/api'

interface Props { offers: Offer[] }

export function OffersSection({ offers }: Props) {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Offers</p>
          <h2 className="font-heading text-3xl font-semibold text-slate-950">Seasonal offers & packages</h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {offers.map((o) => (
            <div key={o.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h3 className="text-lg font-semibold text-slate-900">{o.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{o.subtitle}</p>
              <p className="mt-3 text-sm text-slate-500">{o.validThrough}</p>
              <div className="mt-4">
                <Button variant="outline">{o.cta}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
