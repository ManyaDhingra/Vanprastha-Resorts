import type { Room } from '@/types/api'

export const rooms: Room[] = [
  {
    id: 'river-pavilion-suite',
    title: 'River Pavilion Suite',
    category: 'Suite',
    description: 'A serene suite with floor-to-ceiling windows overlooking the river and private garden terrace.',
    capacity: 'Up to 3 guests',
    size: '68 m²',
    pricePerNight: '₹42,000',
    image: '/images/room-river-pavilion.svg',
    highlights: ['Private terrace', 'Signature bath ritual', 'Forest-view lounge']
  },
  {
    id: 'hillside-villa',
    title: 'Hillside Villa',
    category: 'Villa',
    description: 'A spacious villa tucked into the mountain slope with private pool, daybed and open-plan living.',
    capacity: 'Up to 4 guests',
    size: '96 m²',
    pricePerNight: '₹58,000',
    image: '/images/room-hillside-villa.svg',
    highlights: ['Private pool', 'Panoramic mountain views', 'Separate living area']
  },
  {
    id: 'forest-retreat-suite',
    title: 'Forest Retreat Suite',
    category: 'Suite',
    description: 'A calm suite with timber accents, a fireplace and direct access to the resort’s meditation garden.',
    capacity: 'Up to 2 guests',
    size: '60 m²',
    pricePerNight: '₹38,500',
    image: '/images/room-forest-retreat.svg',
    highlights: ['Garden access', 'Soft lighting', 'Rain shower']
  }
]
