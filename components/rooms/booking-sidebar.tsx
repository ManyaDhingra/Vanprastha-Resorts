"use client"

import { AvailabilityWidget } from './availability-widget'

export function BookingSidebar({
  roomId,
  pricePerNight,
  capacity,
}: {
  roomId: string
  pricePerNight: number
  capacity: number
}) {
  return (
    <aside className="sticky top-24 w-full max-w-sm self-start">
      <div className="mb-6">
        <AvailabilityWidget roomId={roomId} pricePerNight={pricePerNight} capacity={capacity} />
      </div>
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-card">
        <div className="text-sm text-slate-600">Need help?</div>
        <div className="mt-3 text-sm text-slate-900">Contact our reservations team for personalized arrangements.</div>
        <a href="mailto:reservations@vanprastha-resorts.example" className="mt-4 inline-block text-sm text-primary">Email reservations</a>
      </div>
    </aside>
  )
}