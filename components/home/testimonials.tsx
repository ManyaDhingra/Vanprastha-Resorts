import type { Testimonial } from '@/lib/shared/content-types'

interface Props { testimonials: Testimonial[] }

export function TestimonialsSection({ testimonials }: Props) {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">Quiet praise from guests</h2>
          <p className="mt-3 text-sm text-text-muted">Words that stayed with us</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <blockquote key={t.id} className="rounded-xl bg-surface p-6 shadow-card">
              <p className="text-sm text-text-muted">“{t.quote}”</p>
              <footer className="mt-4 text-sm text-text-muted">— {t.guest}, {t.location}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
