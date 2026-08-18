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

export const metadata: Metadata = {
  title: 'Vanprastha Resorts | Luxury mountain resort in Uttarakhand',
  description: 'A premium mountain resort retreat offering calm hospitality, wellness programs and mountain-view villas in Uttarakhand.'
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Rooms come from the DB — the single source of truth for the catalog.
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { pricePerNight: 'asc' },
    take: 3,
  })

  return (
    <main>
      <Hero />
      <div className="relative -mt-20 px-6 sm:-mt-24 lg:-mt-28">
        <div className="mx-auto w-full max-w-[1100px]">
          <BookingCard />
        </div>
      </div>

      <WhyChoose />
      <FeaturedRooms rooms={rooms} />
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