"use client"

import Image from 'next/image'
import type { Experience } from '@/types/api'
import { Container } from '@/components/ui/container'

interface Props { experiences: Experience[] }

export function ExperiencesSection({ experiences }: Props) {
  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-500">Experiences</p>
          <h2 className="font-heading text-3xl font-semibold text-slate-950">Curated mountain experiences</h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((ex) => (
            <article key={ex.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
              <div className="relative h-40 w-full rounded-lg overflow-hidden">
                <Image src={ex.image} alt={ex.name} fill className="object-cover" />
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-slate-900">{ex.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{ex.description}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
                  <span>{ex.duration}</span>
                  <span className="capitalize">{ex.intensity}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
