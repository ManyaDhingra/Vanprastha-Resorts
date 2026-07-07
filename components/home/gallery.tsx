"use client"

import Image from 'next/image'
import type { GalleryItem } from '@/types/api'

interface Props { items: GalleryItem[] }

export function GallerySection({ items }: Props) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Gallery</p>
          <h2 className="font-heading text-3xl font-semibold text-slate-950">A visual journey</h2>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {items.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-2xl">
              <div className="relative h-56 w-full">
                <Image src={g.image} alt={g.title} fill className="object-cover" />
              </div>
              <div className="mt-2 text-sm text-slate-600">{g.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
