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
      <div className="rounded-xl border border-border/60 bg-surface p-4 shadow-card">
        <div className="text-sm text-text-muted">Need help?</div>
        <div className="mt-3 text-sm text-text">Contact our reservations team for personalized arrangements.</div>
      </div>
    </aside>
  )
}
