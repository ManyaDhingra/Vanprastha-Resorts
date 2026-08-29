import type { Metadata } from 'next'
import { prisma } from '@/lib/server/prisma'
import { Hero } from '@/components/home/hero'
import { BookingCard } from '@/components/home/booking-card'
import { WhyChoose } from '@/components/home/why-choose'
import { FeaturedRooms } from '@/components/home/featured-rooms'
import { AmenitiesSection } from '@/components/home/amenities'
import { ExperiencesSection } from '@/components/home/experiences'
import { QuoteBanner } from '@/components/home/quote-banner'
import { QuoteSection } from '@/components/home/quote'
import { OffersSection } from '@/components/home/offers'
import { GallerySection } from '@/components/home/gallery'
import { TestimonialsSection } from '@/components/home/testimonials'
import { offers } from '@/data/offers'
import { testimonials } from '@/data/testimonials'
import { gallery as galleryItems } from '@/data/gallery'
import { amenities } from '@/data/amenities'
import { experiences } from '@/data/experiences'
import type { RoomDto } from '@/lib/shared/types'

export const metadata: Metadata = {
  title: 'Vanprastha Resorts | Luxury mountain resort in Uttarakhand',
  description: 'A premium mountain resort retreat offering calm hospitality, wellness programs and mountain-view villas in Uttarakhand.'
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { pricePerNight: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      blockId: true,
      description: true,
      capacity: true,
      size: true,
      pricePerNight: true,
      image: true,
      highlights: true,
      isActive: true,
    },
  })

  const featuredRooms = rooms.slice(0, 3)

  return (
    <main>
      <Hero />
      <div className="relative z-10 -mt-20 px-6 sm:-mt-24 lg:-mt-28">
        <div className="mx-auto w-full max-w-[1100px]">
          <BookingCard rooms={rooms as RoomDto[]} />
        </div>
      </div>

      <WhyChoose />
      <FeaturedRooms rooms={featuredRooms as RoomDto[]} />
      <AmenitiesSection amenities={amenities} />
      <ExperiencesSection experiences={experiences} />
      <QuoteBanner />
      <QuoteSection />
      <OffersSection offers={offers} />
      <GallerySection items={galleryItems} />
      <TestimonialsSection testimonials={testimonials} />
    </main>
  )
}