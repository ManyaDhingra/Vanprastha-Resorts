"use client"

import Image from 'next/image'
import Link from 'next/link'
import type { Room } from '@/types/api'

interface Props { room: Room }

export function RoomCard({ room }: Props) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <div className="relative h-48 w-full">
        <Image src={room.image} alt={room.title} fill className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900">{room.title}</h3>
        <p className="mt-2 text-sm text-slate-600">{room.description}</p>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
          <div>{room.size} • {room.capacity}</div>
          <div className="font-semibold">{room.pricePerNight}</div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Link href={`/rooms/${room.id}`} className="text-sm font-medium text-primary">View details</Link>
          <Link href="/book" className="text-sm font-semibold">Book</Link>
        </div>
      </div>
    </article>
  )
}
