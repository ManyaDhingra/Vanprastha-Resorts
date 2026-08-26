"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiFetch, formatINR, todayIST } from '@/lib/utils'

type Availability = 'idle' | 'checking' | 'available' | 'unavailable' | 'error'

/**
 * Real availability check against /api/availability (live booking data).
 * Shows honest states: checking / available / unavailable / error.
 */
export function AvailabilityWidget({
  roomId,
  pricePerNight,
  capacity,
}: {
  roomId: string
  pricePerNight: number
  capacity: number
}) {
  const router = useRouter()
  const [checkIn, setCheckIn] = React.useState<string>('')
  const [checkOut, setCheckOut] = React.useState<string>('')
  const [guests, setGuests] = React.useState<number>(2)
  const [availability, setAvailability] = React.useState<Availability>('idle')

  const datesValid = checkIn && checkOut && checkOut > checkIn

  async function check(e?: React.FormEvent) {
    e?.preventDefault()
    if (!datesValid) return
    setAvailability('checking')
    try {
      const data = await apiFetch<{ available: boolean }>(
        `/api/availability?roomId=${roomId}&checkIn=${checkIn}&checkOut=${checkOut}`
      )
      setAvailability(data.available ? 'available' : 'unavailable')
    } catch {
      setAvailability('error')
    }
  }

  function book() {
    const params = new URLSearchParams()
    params.set('room', roomId)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', String(guests))
    router.push(`/book?${params.toString()}`)
  }

  return (
    <form onSubmit={check} className="rounded-2xl border border-border/60 bg-surface p-6 shadow-card">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-2xl font-semibold text-text">{formatINR(pricePerNight)}</span>
          <span className="text-sm text-text-muted"> / night</span>
        </div>
        <span className="text-xs text-text-muted">up to {capacity} guests</span>
      </div>

      <div className="mt-4 text-sm text-text-muted">From</div>
      <input
        type="date"
        min={todayIST()}
        value={checkIn}
        onChange={(e) => { setCheckIn(e.target.value); setAvailability('idle') }}
        className="mt-2 w-full rounded-md border border-border px-3 py-2"
        required
      />

      <div className="mt-3 text-sm text-text-muted">To</div>
      <input
        type="date"
        min={checkIn || todayIST()}
        value={checkOut}
        onChange={(e) => { setCheckOut(e.target.value); setAvailability('idle') }}
        className="mt-2 w-full rounded-md border border-border px-3 py-2"
        required
      />

      <div className="mt-3 text-sm text-text-muted">Guests</div>
      <select
        value={String(guests)}
        onChange={(e) => setGuests(Number(e.target.value))}
        className="mt-2 w-full rounded-md border border-border px-3 py-2"
      >
        {Array.from({ length: Math.min(6, Math.max(1, capacity)) }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      {availability === 'checking' && (
        <p className="mt-3 text-sm text-text-muted">Checking availability…</p>
      )}
      {availability === 'available' && (
        <p className="mt-3 text-sm text-emerald-700">✓ Available for these dates</p>
      )}
      {availability === 'unavailable' && (
        <p className="mt-3 text-sm text-red-700">Not available for these dates.</p>
      )}
      {availability === 'error' && (
        <p className="mt-3 text-sm text-amber-700">
          Could not check availability. You may still book; the system rejects unavailable dates.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <Button type="submit" variant="outline" disabled={!datesValid || availability === 'checking'}>
          {availability === 'checking' ? 'Checking…' : 'Check availability'}
        </Button>
        <Button type="button" onClick={book}>Book this room</Button>
      </div>
    </form>
  )
}
