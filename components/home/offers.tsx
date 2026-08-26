"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Offer } from '@/lib/shared/content-types'

interface Props { offers: Offer[] }

export function OffersSection({ offers }: Props) {
  const router = useRouter()
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">Seasonal offers & packages</h2>
          <p className="mt-3 text-sm text-text-muted">Stay longer, return calmer</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {offers.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border/60 bg-surface p-6 shadow-card">
              <h3 className="text-lg font-semibold text-text">{o.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{o.subtitle}</p>
              <p className="mt-3 text-sm text-text-muted">{o.validThrough}</p>
              <div className="mt-4">
                <Button variant="outline" onClick={() => router.push('/book')}>{o.cta}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

