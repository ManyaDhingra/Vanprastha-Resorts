export interface Room {
  id: string
  title: string
  category: string
  description: string
  capacity: string
  size: string
  pricePerNight: string
  image: string
  highlights: string[]
}

export interface Offer {
  id: string
  title: string
  subtitle: string
  description: string
  validThrough: string
  cta: string
}

export interface Testimonial {
  id: string
  guest: string
  location: string
  quote: string
  category: string
}

export interface GalleryItem {
  id: string
  title: string
  image: string
  caption: string
}

export interface Amenity {
  id: string
  name: string
  description: string
  icon: string
}

export interface Experience {
  id: string
  name: string
  description: string
  duration: string
  intensity: string
  image: string
}
