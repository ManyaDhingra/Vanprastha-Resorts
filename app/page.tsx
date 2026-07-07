import type { Metadata } from 'next'
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
import { fetchRooms, fetchOffers, fetchTestimonials, fetchGallery, fetchAmenities, fetchExperiences } from '@/lib/fetchers'

export const metadata: Metadata = {
  title: 'Vanprastha Resorts | Luxury mountain resort in Uttarakhand',
  description: 'A premium mountain resort retreat offering calm hospitality, wellness programs and mountain-view villas in Uttarakhand.'
}

export default async function HomePage() {
  const [rooms, offers, testimonials, gallery, amenities, experiences] = await Promise.all([
    fetchRooms(),
    fetchOffers(),
    fetchTestimonials(),
    fetchGallery(),
    fetchAmenities(),
    fetchExperiences()
  ])

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
      <GallerySection items={gallery} />
      <TestimonialsSection testimonials={testimonials} />
    </main>
  )
}
