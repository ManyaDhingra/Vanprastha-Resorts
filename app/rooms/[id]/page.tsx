import type { Metadata } from 'next'
import type { GalleryItem, Room, Testimonial } from '@/types/api'
import Image from 'next/image'
import { DetailGallery } from '@/components/rooms/detail-gallery'
import { RoomSpecs } from '@/components/rooms/room-specs'
import { BookingSidebar } from '@/components/rooms/booking-sidebar'
import { RoomReviews } from '@/components/rooms/room-reviews'
import { RelatedRooms } from '@/components/rooms/related-rooms'
import { fetchRooms, fetchTestimonials, fetchGallery } from '@/lib/fetchers'

type RoomPageParams = { id: string }

type RoomPageProps = {
  params: Promise<RoomPageParams>
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  const { id } = await params
  const rooms = await fetchRooms()
  const room = rooms.find((r: Room) => r.id === id)
  return {
    title: room ? `${room.title} — Vanprastha Resorts` : 'Room — Vanprastha Resorts',
    description: room ? room.description : undefined
  }
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params
  const [rooms, testimonials, gallery] = await Promise.all([fetchRooms(), fetchTestimonials(), fetchGallery()])
  const room = rooms.find((r: Room) => r.id === id)
  if (!room) return <div className="p-12 text-center">Room not found.</div>

  const related = rooms.filter((r: any) => r.id !== room.id).slice(0, 2)
  const reviews = testimonials.slice(0, 4)
  const images = [room.image, ...gallery.map((g: any) => g.image)].slice(0, 6)

  const specs = {
    'Room type': room.category,
    'Capacity': room.capacity,
    'Size': room.size,
    'Highlights': room.highlights.join(', ')
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-6">
              <h1 className="font-heading text-3xl font-semibold text-slate-900">{room.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{room.description}</p>
            </div>

            <DetailGallery images={images} />

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RoomSpecs specs={specs} />

                <div className="mt-6">
                  <h4 className="mb-3 text-lg font-semibold text-slate-900">About this room</h4>
                  <p className="text-sm text-slate-700">{room.description}</p>
                </div>

                <div className="mt-8">
                  <RoomReviews reviews={reviews} />
                </div>

                <div className="mt-8">
                  <RelatedRooms rooms={related} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <BookingSidebar price={room.pricePerNight} />
          </div>
        </div>
      </div>
    </main>
  )
}
