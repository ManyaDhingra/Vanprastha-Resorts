import Image from 'next/image'
import type { Experience } from '@/lib/shared/content-types'
import { Container } from '@/components/ui/container'

interface Props { experiences: Experience[] }

export function ExperiencesSection({ experiences }: Props) {
  return (
    <section className="py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">Curated mountain experiences</h2>
          <p className="mt-3 text-sm text-text-muted">Three ways to experience Vanprastha</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((ex) => (
            <article key={ex.id} className="rounded-2xl border border-border/60 bg-surface p-4 shadow-card">
              <div className="relative h-40 w-full rounded-lg overflow-hidden">
                <Image src={ex.image} alt={ex.name} fill className="object-cover" />
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-semibold text-text">{ex.name}</h3>
                <p className="mt-2 text-sm text-text-muted">{ex.description}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-text-muted">
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

