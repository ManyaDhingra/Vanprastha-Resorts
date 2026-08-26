import type { Metadata } from 'next'
import { BookingFlow } from '@/components/booking/booking-flow'

export const metadata: Metadata = {
  title: 'Reserve your stay — Vanprastha Resorts',
  description:
    'Book your mountain stay at Vanprastha Resorts. Pick dates, choose a pavilion and pay securely via Razorpay.',
}

export default function BookPage() {
  return (
    <main className="min-h-[calc(100vh-200px)] pb-16 pt-28">
      <div className="mx-auto max-w-7xl px-6">
        <BookingFlow />
      </div>
    </main>
  )
}
