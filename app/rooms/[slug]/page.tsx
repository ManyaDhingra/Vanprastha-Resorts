import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/server/prisma'
import { DetailGallery } from '@/components/rooms/detail-gallery'
import { RoomSpecs } from '@/components/rooms/room-specs'
import { BookingSidebar } from '@/components/rooms/booking-sidebar'
import { RelatedRooms } from '@/components/rooms/related-rooms'
import { BlockRoomsClient } from '@/components/rooms/block-rooms-client'
import { getBlockBySlug } from '@/lib/shared/blocks'
import { gallery } from '@/data/gallery'
import { formatINR } from '@/lib/utils'

type RoomPageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { slug } = await params

  const block = getBlockBySlug(slug)
  if (block) {
    return {
      title: `${block.name} — Vanprastha Resorts`,
      description: block.description,
    }
  }

  const room = await prisma.room.findFirst({ where: { slug, isActive: true } })
  return {
    title: room ? `${room.title} — Vanprastha Resorts` : 'Room — Vanprastha Resorts',
    description: room?.description ?? undefined,
  }
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { slug } = await params

  const block = getBlockBySlug(slug)
  if (block) {
    const rooms = await prisma.room.findMany({
      where: { isActive: true, block: block.id },
      orderBy: { pricePerNight: 'asc' },
    })
    return <BlockRoomsClient rooms={rooms} block={block} />
  }

  const room = await prisma.room.findFirst({ where: { slug, isActive: true } })
  if (!room) notFound()

  const images = [room.image, ...gallery.map((g) => g.image)].slice(0, 6)

  const specs = {
    'Capacity': `${room.capacity} guest${room.capacity === 1 ? '' : 's'}`,
    'Size': `${room.size} sq ft`,
    'Highlights': room.highlights.length > 0 ? room.highlights.join(' · ') : '—',
  }

  const related = await prisma.room.findMany({
    where: { isActive: true, id: { not: room.id } },
    orderBy: { pricePerNight: 'asc' },
    take: 2,
  })

  return (
    <main className="pt-28 pb-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h1 className="font-heading text-3xl font-normal leading-[1.15] text-text sm:text-4xl">{room.title}</h1>
              <p className="text-text-muted">{formatINR(room.pricePerNight)}/night</p>
            </div>
            <p className="mt-2 text-sm font-medium tracking-wide text-text-muted">{room.category}</p>

            <div className="mt-6">
              <DetailGallery images={images} alt={`${room.title} room`} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border/60 bg-surface p-6 shadow-card">
                <h2 className="text-lg font-semibold text-text">About this room</h2>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">{room.description}</p>
              </div>
              <RoomSpecs specs={specs} />
            </div>

            <div className="mt-8">
              <RelatedRooms rooms={related} />
            </div>
          </div>

          <BookingSidebar roomId={room.id} pricePerNight={room.pricePerNight} capacity={room.capacity} />
        </div>
      </div>
    </main>
  )
}
