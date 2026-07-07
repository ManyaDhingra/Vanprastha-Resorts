"use client"

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Room } from '@/types/api'

interface Props {
  rooms: Room[]
}

export function FeaturedRooms({ rooms }: Props) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Featured rooms</p>
            <h2 className="font-heading text-2xl font-semibold text-slate-950">Handpicked pavilions & villas</h2>
          </div>
          <Link href="/rooms" className="text-sm font-medium text-slate-700">View all rooms</Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {rooms.map((room) => (
            <motion.article key={room.id} whileHover={{ scale: 1.02 }} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
              <div className="relative h-44 w-full">
                <Image src={room.image} alt={room.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-950">{room.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{room.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
                  <span>{room.size}</span>
                  <span className="font-semibold">{room.pricePerNight}</span>
                </div>
                <div className="mt-4">
                  <Link href={`/rooms/${room.id}`} className="text-sm font-medium text-primary">View details</Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
