import Image from 'next/image'
import type { GalleryItem } from '@/lib/shared/content-types'

interface Props { items: GalleryItem[] }

export function GallerySection({ items }: Props) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">A visual journey</h2>
          <p className="mt-3 text-sm text-text-muted">Snow, mountains, gardens — Vanprastha in three frames</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {items.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-2xl">
              <div className="relative h-56 w-full">
                <Image src={g.image} alt={g.title} fill className="object-cover" />
              </div>
              <div className="mt-2 text-sm text-text-muted">{g.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

