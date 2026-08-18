import Link from 'next/link'
import Image from 'next/image'
import type { RoomDto } from '@/lib/shared/types'
import { formatINR } from '@/lib/utils'

export function RelatedRooms({ rooms }: { rooms: RoomDto[] }) {
  return (
    <div>
      <h4 className="mb-4 text-lg font-semibold text-slate-900">Related rooms</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        {rooms.map((r) => (
          <Link key={r.id} href={`/rooms/${r.slug}`} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-3 shadow-card">
            <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
              <Image src={r.image} alt={r.title} fill className="object-cover" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{r.title}</div>
              <div className="mt-1 text-xs text-slate-600">{r.size} sq ft • up to {r.capacity} guests</div>
              <div className="mt-1 text-xs font-semibold text-slate-800">{formatINR(r.pricePerNight)}/night</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}