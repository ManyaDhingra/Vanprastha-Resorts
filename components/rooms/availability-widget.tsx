"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'

export function AvailabilityWidget({ price }: { price: string }) {
  const [checkIn, setCheckIn] = React.useState<string>('')
  const [checkOut, setCheckOut] = React.useState<string>('')
  const [guests, setGuests] = React.useState<number>(2)
  const [loading, setLoading] = React.useState(false)
  const [available, setAvailable] = React.useState<boolean | null>(null)

  const check = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setAvailable(true)
    setLoading(false)
  }

  return (
    <form onSubmit={check} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
      <div className="text-sm text-slate-600">From</div>
      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2" required />

      <div className="mt-3 text-sm text-slate-600">To</div>
      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2" required />

      <div className="mt-3 text-sm text-slate-600">Guests</div>
      <select value={String(guests)} onChange={(e) => setGuests(Number(e.target.value))} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2">
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
      </select>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">Price per night</div>
          <div className="font-semibold text-slate-900">{price}</div>
        </div>
        <Button type="submit" className="min-w-[140px]">{loading ? 'Checking…' : 'Check availability'}</Button>
      </div>

      {available === true && <div className="mt-4 text-sm text-success">Available — proceed to booking.</div>}
    </form>
  )
}
