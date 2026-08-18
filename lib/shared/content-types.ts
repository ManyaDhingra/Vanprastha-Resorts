/** Types for static marketing content (offers, amenities, experiences,
 * testimonials, gallery). These live in code by design — they are editorial
 * content, not transactional data; the DB stays the single source for
 * rooms, bookings, users, and payments. */

export interface Offer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  validThrough: string;
  cta: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Experience {
  id: string;
  name: string;
  description: string;
  duration: string;
  intensity: string;
  image: string;
}

export interface Testimonial {
  id: string;
  guest: string;
  location: string;
  quote: string;
  category: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  image: string;
  caption: string;
}