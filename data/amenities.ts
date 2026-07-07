import type { Amenity } from '@/types/api'

export const amenities: Amenity[] = [
  {
    id: 'spa-sanctum',
    name: 'Spa Sanctum',
    description: 'A holistic spa with Himalayan herbal therapies, steam rituals and private treatment pavilions.',
    icon: 'spa'
  },
  {
    id: 'wellness-hall',
    name: 'Wellness Hall',
    description: 'Guided yoga, breathwork sessions and personalized meditation programs in a calm studio setting.',
    icon: 'leaf'
  },
  {
    id: 'farm-to-table',
    name: 'Farm-to-Table Dining',
    description: 'Seasonal cuisine prepared with mountain herbs, local produce and elegant plating.',
    icon: 'utensils'
  },
  {
    id: 'library-lounge',
    name: 'Library Lounge',
    description: 'A quiet lounge with curated books, tea service and mountain views for slow afternoons.',
    icon: 'book-open'
  }
]
