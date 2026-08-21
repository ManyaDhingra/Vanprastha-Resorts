"use client"

import * as React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiFetch, formatINR } from '@/lib/utils'
import type { BookingDto } from '@/lib/shared/types'

export default function ConfirmationPage() {
  return (
    <React.Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16 text-sm text-text-muted">Loading…</div>}>
      <Confirmation />
    </React.Suspense>
  )
}

function Confirmation() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [booking, setBooking] = React.useState<BookingDto | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!id) {
      setError('Missing booking reference. Find your bookings in your profile.')
      return
    }
    apiFetch<BookingDto>(`/api/bookings/${id}`)
      .then(setBooking)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load booking.'))
  }, [id])

  if (error) {
    return (
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-2xl px-6">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
            <h1 className="font-heading text-2xl font-normal text-text">Reservation</h1>
            <p className="mt-3 text-sm text-red-700">{error}</p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/profile">View my bookings</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!booking) {
    return (
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-2xl px-6 text-sm text-text-muted">Loading booking…</div>
      </main>
    )
  }

  const isConfirmed = booking.status === 'CONFIRMED'

  return (
    <main className="pt-28 pb-16">
      <div className="mx-auto max-w-2xl px-6">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A6330]">
            {isConfirmed ? 'Payment confirmed' : 'Reservation received'}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-normal leading-tight text-text">
            {isConfirmed ? 'Your stay is booked.' : 'We’ve saved your request.'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            {isConfirmed
              ? 'Your payment has been verified and your booking is confirmed. Keep this reference — you’ll need it at check-in.'
              : 'Your booking is pending. Our team will contact you to complete payment and confirm your stay.'}
          </p>

          <div className="mt-8 grid gap-4 rounded-xl border border-border/60 bg-background p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-text-muted">Booking reference</div>
                <div className="mt-1 font-mono text-sm font-semibold text-text">{booking.id}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isConfirmed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {booking.status}
              </span>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Total paid</span>
                <span className="font-semibold text-text">{formatINR(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Dates</span>
                <span className="text-text">{new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Guests</span>
                <span className="text-text">{booking.guests}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-secondary p-4 text-sm leading-6 text-text-muted">
            <p className="font-medium text-text">Next steps</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Manage your stay from your profile — view, or cancel if needed.</li>
              <li>Questions? Contact reservations — share your booking reference.</li>
              <li>Check-in is from 2 PM. Early arrival on request.</li>
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/profile">View my bookings</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/rooms">Explore more stays</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
