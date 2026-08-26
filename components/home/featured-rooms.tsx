"use client"

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { RoomDto } from '@/lib/shared/types'
import { formatINR } from '@/lib/utils'

interface Props {
  rooms: RoomDto[]
}

export function FeaturedRooms({ rooms }: Props) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between gap-6">
          <h2 className="font-heading text-3xl font-normal leading-[1.15] text-text">Handpicked pavilions & villas</h2>
          <Link href="/rooms" className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline">View all rooms →</Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {rooms.map((room) => (
            <motion.article key={room.id} whileHover={{ scale: 1.02 }} className="overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-card">
              <div className="relative h-44 w-full">
                <Image src={room.image} alt={room.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-text">{room.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-text-muted">{room.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
                  <span>{room.size} sq ft • up to {room.capacity} guests</span>
                  <span className="font-semibold">{formatINR(room.pricePerNight)}
                    <span className="ml-1 text-xs font-normal text-text-muted">/night</span>
                  </span>
                </div>
                <div className="mt-4">
                  <Link href={`/rooms/${room.slug}`} className="text-sm font-medium text-primary">View details</Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
