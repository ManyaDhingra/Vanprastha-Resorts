import type { Experience } from '@/lib/shared/content-types'

export const experiences: Experience[] = [
  {
    id: 'sunrise-yoga',
    name: 'Sunrise Mountain Yoga',
    description: 'Begin the day with gentle mountain yoga, breathwork and sunrise views over the river valley.',
    duration: '75 minutes',
    intensity: 'Gentle',
    image: '/images/experience-1.jpg'
  },
  {
    id: 'river-cruise',
    name: 'River Heritage Cruise',
    description: 'A quiet boat journey through the valley with stories of local traditions and hillside tea stops.',
    duration: '2 hours',
    intensity: 'Leisurely',
    image: '/images/experience-2.jpg'
  },
  {
    id: 'forest-walk',
    name: 'Guided Forest Walk',
    description: 'A guided walk through cedar groves with a naturalist who explains mountain flora and the resort’s herbal gardens.',
    duration: '90 minutes',
    intensity: 'Moderate',
    image: '/images/experience-3.jpg'
  }
]
