"use client"

import { Check } from 'lucide-react'

export function WhyChoose() {
  const items = [
    {
      title: 'Intentional design',
      desc: 'Quiet architecture and generous room planning that honours the mountain landscape.'
    },
    {
      title: 'Wellness-first service',
      desc: 'Curated spa rituals, guided movement and restorative culinary journeys.'
    },
    {
      title: 'Thoughtful hospitality',
      desc: 'Personalised guest experiences, discreet service and attention to detail.'
    }
  ]

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Why choose us</p>
          <h2 className="font-heading text-3xl font-semibold text-slate-950">A quiet, purposeful hospitality</h2>
          <p className="mt-4 text-slate-600">We focus on calm design, restorative services and curated experiences that return clarity and rest.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-xl border border-slate-100 bg-white p-6 shadow-card">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-[#E9F3F0] p-3 text-[#276A45]">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{it.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{it.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
