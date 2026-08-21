"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { todayIST } from '@/lib/utils'

/**
 * Hero availability card: submits dates/guests to the booking flow, which
 * validates availability and takes over from there. No fake "available"
 * responses are ever shown here.
 */
export function BookingCard() {
  const router = useRouter()
  const [checkIn, setCheckIn] = React.useState('')
  const [checkOut, setCheckOut] = React.useState('')
  const [guests, setGuests] = React.useState('2')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', guests)
    router.push(`/book?${params.toString()}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto w-full max-w-[1100px] rounded-[32px] bg-surface/95 px-7 py-7 shadow-2xl"
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="sr-only" htmlFor="bc-checkin">Check in</label>
        <input
          id="bc-checkin"
          type="date"
          min={todayIST()}
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          aria-label="Check in"
          className="rounded-md border border-border bg-surface px-3 py-2 text-text"
        />

        <label className="sr-only" htmlFor="bc-checkout">Check out</label>
        <input
          id="bc-checkout"
          type="date"
          min={checkIn || todayIST()}
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
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
          <Button type="submit" className="w-full">Check availability</Button>
        </div>
      </form>
    </motion.div>
  )
}
