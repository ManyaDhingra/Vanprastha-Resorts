"use client"

import * as React from 'react'
import { RoomCard } from './room-card'
import { RoomsFilters, type RoomFilters } from './rooms-filters'
import { Pagination } from './pagination'
import { SortSelect } from './sort-select'
import { parsePrice } from '@/lib/utils'
import type { Room } from '@/types/api'

export function RoomsPageClient() {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filters, setFilters] = React.useState<RoomFilters>({})
  const [sort, setSort] = React.useState('recommended')
  const [page, setPage] = React.useState(1)
  const perPage = 6

  React.useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/rooms')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return
        setRooms(data)
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  const types = React.useMemo(() => Array.from(new Set(rooms.map((r) => r.category))), [rooms])

  const filtered = React.useMemo(() => {
    let out = rooms.slice()
    if (filters.type) out = out.filter((r) => r.category === filters.type)
    if (filters.guests) out = out.filter((r) => {
      const m = r.capacity.match(/\d+/)
      return m ? Number(m[0]) >= filters.guests! : true
    })
    if (filters.priceMin !== undefined) out = out.filter((r) => parsePrice(r.pricePerNight) >= (filters.priceMin || 0))
    if (filters.priceMax !== undefined) out = out.filter((r) => parsePrice(r.pricePerNight) <= (filters.priceMax || Infinity))

    if (sort === 'price-asc') {
      out.sort((a, b) => parsePrice(a.pricePerNight) - parsePrice(b.pricePerNight))
    } else if (sort === 'price-desc') {
      out.sort((a, b) => parsePrice(b.pricePerNight) - parsePrice(a.pricePerNight))
    }
    return out
  }, [rooms, filters, sort])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / perPage))
  const paged = React.useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page])

  React.useEffect(() => setPage(1), [filters, sort])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Rooms</h1>
        <div className="flex items-center gap-4">
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="mb-6">
        <RoomsFilters types={types} onChange={setFilters} />
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-600">Loading rooms…</div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>

          <Pagination page={page} total={total} perPage={perPage} onPageChange={setPage} />
          {total === 0 && <p className="mt-6 text-center text-slate-600">No rooms matched your filters.</p>}
        </>
      )}
    </div>
  )
}
