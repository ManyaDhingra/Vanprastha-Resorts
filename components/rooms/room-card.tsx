import Link from 'next/link'
import Image from 'next/image'
import type { RoomDto } from '@/lib/shared/types'
import { formatINR } from '@/lib/utils'

interface Props { room: RoomDto }

export function RoomCard({ room }: Props) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
      <div className="relative h-48 w-full">
        <Image src={room.image} alt={room.title} fill className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-900">{room.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{room.description}</p>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
          <div>{room.size} sq ft • up to {room.capacity} guests</div>
          <div className="font-semibold">{formatINR(room.pricePerNight)}
            <span className="ml-1 text-xs font-normal text-slate-400">/night</span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Link href={`/rooms/${room.slug}`} className="text-sm font-medium text-primary">View details</Link>
          <Link href={`/book?room=${room.slug}`} className="text-sm font-semibold">Book</Link>
        </div>
      </div>
    </article>
  )
}