import { rooms } from '@/data/rooms'
import { offers } from '@/data/offers'
import { testimonials } from '@/data/testimonials'
import { gallery } from '@/data/gallery'
import { amenities } from '@/data/amenities'
import { experiences } from '@/data/experiences'

export async function fetchRooms() {
  return rooms
}

export async function fetchOffers() {
  return offers
}

export async function fetchTestimonials() {
  return testimonials
}

export async function fetchGallery() {
  return gallery
}

export async function fetchAmenities() {
  return amenities
}

export async function fetchExperiences() {
  return experiences
}

export async function createBooking(payload: any) {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) throw new Error('Unable to create booking')
  return response.json()
}
