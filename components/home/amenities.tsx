import type { Amenity } from '@/lib/shared/content-types'

interface Props { amenities: Amenity[] }

export function AmenitiesSection({ amenities }: Props) {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">Services crafted for restoration</h2>
          <p className="mt-3 text-sm text-text-muted">Four calm services, no clutter</p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {amenities.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border/60 bg-surface p-6 shadow-card">
              <h3 className="text-[15px] font-semibold leading-tight text-text">{a.name}</h3>
              <p className="mt-2 text-sm leading-6 text-text-muted">{a.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

