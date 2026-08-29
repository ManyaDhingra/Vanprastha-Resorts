"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { apiFetch, calculateNights, formatINR, todayIST } from '@/lib/utils'
import type { RoomDto } from '@/lib/shared/types'

type RoomAvailability = 'idle' | 'checking' | 'done'

/**
 * Hero availability card: lets the user pick dates/guests, then checks
 * availability for every room and displays which are bookable.
 */
export function BookingCard({ rooms }: { rooms: RoomDto[] }) {
  const router = useRouter()
  const [checkIn, setCheckIn] = React.useState('')
  const [checkOut, setCheckOut] = React.useState('')
  const [guests, setGuests] = React.useState('2')
  const [status, setStatus] = React.useState<RoomAvailability>('idle')
  const [availability, setAvailability] = React.useState<Record<string, boolean>>({})
  const [error, setError] = React.useState<string | null>(null)

  const datesValid = checkIn && checkOut && checkOut > checkIn

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!datesValid) return
    setStatus('checking')
    setError(null)
    setAvailability({})

    try {
      const results = await Promise.all(
        rooms.map(async (room) => {
          try {
            const data = await apiFetch<{ available: boolean }>(
              `/api/availability?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`
            )
            return [room.id, data.available] as const
          } catch {
            return [room.id, false] as const
          }
        })
      )
      const map: Record<string, boolean> = {}
      for (const [id, available] of results) map[id] = available
      setAvailability(map)
      setStatus('done')
    } catch {
      setError('Could not check availability. Please try again.')
      setStatus('idle')
    }
  }

  function bookRoom(roomId: string) {
    const params = new URLSearchParams()
    params.set('room', roomId)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', guests)
    router.push(`/book?${params.toString()}`)
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] rounded-[32px] bg-surface/95 px-7 py-7 shadow-2xl">
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="sr-only" htmlFor="bc-checkin">Check in</label>
        <input
          id="bc-checkin"
          type="date"
          min={todayIST()}
          value={checkIn}
          onChange={(e) => { setCheckIn(e.target.value); setStatus('idle'); setAvailability({}) }}
          aria-label="Check in"
          className="rounded-md border border-border bg-surface px-3 py-2 text-text"
        />

        <label className="sr-only" htmlFor="bc-checkout">Check out</label>
        <input
          id="bc-checkout"
          type="date"
          min={checkIn || todayIST()}
          value={checkOut}
          onChange={(e) => { setCheckOut(e.target.value); setStatus('idle'); setAvailability({}) }}
          aria-label="Check out"
          className="rounded-md border border-border bg-surface px-3 py-2 text-text"
        />

        <label className="sr-only" htmlFor="bc-guests">Guests</label>
        <select
          id="bc-guests"
          aria-label="Guests"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-text"
        >
          <option value="1">1 guest</option>
          <option value="2">2 guests</option>
          <option value="3">3 guests</option>
          <option value="4">4 guests</option>
        </select>

        <div className="flex items-center">
          <Button type="submit" className="w-full" disabled={!datesValid || status === 'checking'}>
            {status === 'checking' ? 'Checking…' : 'Check availability'}
          </Button>
        </div>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {status === 'done' && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const available = availability[room.id] ?? false
            const nights = calculateNights(checkIn, checkOut)
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden rounded-xl border border-border/60 bg-surface shadow-sm"
              >
                <div className="relative h-32 w-full">
                  <Image src={room.image} alt={room.title} fill className="object-cover" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-text">{room.title}</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    {room.size} sq ft · up to {room.capacity} guests
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-text">
                      {formatINR(room.pricePerNight)}
                      <span className="ml-1 text-xs font-normal text-text-muted">/night</span>
                    </span>
                    {available ? (
                      <span className="text-xs font-medium text-emerald-700">Available</span>
                    ) : (
                      <span className="text-xs font-medium text-red-600">Booked</span>
                    )}
                  </div>
                  {available && (
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => bookRoom(room.id)}
                    >
                      Book · {formatINR(nights * room.pricePerNight)}
                    </Button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
