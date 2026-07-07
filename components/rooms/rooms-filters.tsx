"use client"

import * as React from 'react'

export interface RoomFilters {
  priceMin?: number
  priceMax?: number
  guests?: number
  type?: string
}

interface Props {
  types: string[]
  onChange: (filters: RoomFilters) => void
}

export function RoomsFilters({ types, onChange }: Props) {
  const [priceMin, setPriceMin] = React.useState('')
  const [priceMax, setPriceMax] = React.useState('')
  const [guests, setGuests] = React.useState('')
  const [type, setType] = React.useState('')

  React.useEffect(() => {
    const payload = {
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      guests: guests ? Number(guests) : undefined,
      type: type || undefined
    }
    onChange(payload)
  }, [priceMin, priceMax, guests, type, onChange])

  return (
    <form className="grid gap-3 sm:grid-cols-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Min price (₹)</label>
        <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2" inputMode="numeric" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Max price (₹)</label>
        <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2" inputMode="numeric" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Guests</label>
        <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2">
          <option value="">Any</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Room type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2">
          <option value="">Any</option>
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </form>
  )
}
