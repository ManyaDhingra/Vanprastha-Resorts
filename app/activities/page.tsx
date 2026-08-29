import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { activities } from '@/data/activities'

export const metadata: Metadata = {
  title: 'Activities — Vanprastha Resorts',
  description:
    'Reconnect with nature, stillness and the mountains at Vanprastha Resorts in the Dunagiri foothills of Uttarakhand.',
}

/* ─── gallery component ──────────────────────────────────────────── */

function ActivityGallery({
  images,
  name,
}: {
  images: { src: string; alt: string; width: number; height: number }[]
  name: string
}) {
  if (images.length === 0) return null

  const [featured, ...rest] = images

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Featured image — spans 2 cols on lg */}
      <div className="relative h-64 overflow-hidden rounded-2xl shadow-card sm:col-span-2 lg:col-span-2 lg:h-80">
        <Image
          src={featured.src}
          alt={featured.alt}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      </div>

      {/* Remaining images */}
      {rest.map((img, i) => (
        <div
          key={i}
          className="relative h-64 overflow-hidden rounded-2xl shadow-card lg:h-80"
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  )
}

/* ─── page ───────────────────────────────────────────────────────── */

export default function ActivitiesPage() {
  return (
    <main>
      {/* ── hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/about/placeholder.svg"
            alt=""
            fill
            className="object-cover opacity-30"
          />
        </div>
        <Container className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="kicker">Experience Vanprastha</p>
            <h1 className="mt-4 font-heading text-4xl font-normal leading-[1.15] text-white sm:text-5xl">
              Activities
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/80">
              Reconnect with nature, stillness and the mountains.
            </p>
          </div>
        </Container>
      </section>

      {/* ── intro ────────────────────────────────────────────────── */}
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[15px] leading-7 text-text-muted">
              At Vanprastha Resorts, every activity is an invitation to slow
              down, breathe deeply and experience the Himalayan landscape.
            </p>
          </div>
        </Container>
      </section>

      {/* ── activities ───────────────────────────────────────────── */}
      {activities.map((activity, i) => (
        <section
          key={activity.id}
          id={activity.id}
          className={i % 2 === 0 ? 'py-16' : 'bg-secondary py-16'}
        >
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <p className="kicker">{activity.name}</p>
              <blockquote className="mt-4 font-heading text-xl italic leading-relaxed text-text sm:text-2xl">
                &ldquo;{activity.quote}&rdquo;
              </blockquote>
            </div>

            <div className="mt-10">
              <ActivityGallery images={activity.images} name={activity.name} />
            </div>
          </Container>
        </section>
      ))}

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-primary py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-normal leading-[1.15] text-white">
              Experience It Yourself
            </h2>
            <p className="mt-4 text-base leading-7 text-white/80">
              Your mountain retreat awaits. Begin planning your stay at
              Vanprastha Resorts.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/rooms"
                className="inline-flex h-12 items-center rounded-full bg-accent px-8 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent/90"
              >
                Explore Rooms
              </Link>
              <Link
                href="/book"
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-8 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Book a Stay
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  )
}
