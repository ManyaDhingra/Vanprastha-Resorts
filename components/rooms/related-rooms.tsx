"use client"

import Link from 'next/link'
import Image from 'next/image'
import type { Room } from '@/types/api'

export function RelatedRooms({ rooms }: { rooms: Room[] }) {
  return (
    <div>
      <h4 className="mb-4 text-lg font-semibold text-slate-900">Related rooms</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        {rooms.map((r) => (
          <Link key={r.id} href={`/rooms/${r.id}`} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-3 shadow-card">
            <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
              <Image src={r.image} alt={r.title} fill className="object-cover" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{r.title}</div>
              <div className="mt-1 text-xs text-slate-600">{r.size} • {r.capacity}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
