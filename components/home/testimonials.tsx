"use client"

import type { Testimonial } from '@/types/api'

interface Props { testimonials: Testimonial[] }

export function TestimonialsSection({ testimonials }: Props) {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Testimonials</p>
          <h2 className="font-heading text-3xl font-semibold text-slate-950">Quiet praise from guests</h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="rounded-xl bg-white p-6 shadow-card">
              <p className="text-sm text-slate-700">“{t.quote}”</p>
              <footer className="mt-4 text-sm text-slate-500">— {t.guest}, {t.location}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
