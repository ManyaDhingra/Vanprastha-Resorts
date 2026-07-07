import type { Offer } from '@/types/api'

export const offers: Offer[] = [
  {
    id: 'wellness-retreat',
    title: 'Wellness Retreat Package',
    subtitle: 'Four nights of mindful renewal',
    description: 'Includes two spa rituals, guided mountain yoga and a curated supper menu with organic farm-to-table cuisine.',
    validThrough: 'Valid until 30 September 2026',
    cta: 'Book the retreat'
  },
  {
    id: 'early-access',
    title: 'Early Arrival Advantage',
    subtitle: 'Check-in from 10 AM',
    description: 'Extend your first day with early arrival, luxury welcome tea and a private resort orientation.',
    validThrough: 'Valid for stays through 31 December 2026',
    cta: 'Reserve early access'
  },
  {
    id: 'mountain-romance',
    title: 'Mountain Romance Escape',
    subtitle: 'Special moments for couples',
    description: 'Includes a private candlelit dinner, couples massage and sunrise river cruise.',
    validThrough: 'Available year-round',
    cta: 'Plan your escape'
  }
]
