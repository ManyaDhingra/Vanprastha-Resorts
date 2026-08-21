"use client"

import * as React from 'react'
import { RoomCard } from './room-card'
import { RoomsFilters, type RoomFilters } from './rooms-filters'
import { Pagination } from './pagination'
import { SortSelect } from './sort-select'
import type { RoomDto } from '@/lib/shared/types'

/**
 * Client-side browsing over a server-provided room list: filters, sort and
 * pagination without any network round-trip. Data always comes from the DB
 * via the server component (app/rooms/page.tsx).
 */
export function RoomsPageClient({ rooms }: { rooms: RoomDto[] }) {
  const [filters, setFilters] = React.useState<RoomFilters>({})
  const [sort, setSort] = React.useState('recommended')
  const [page, setPage] = React.useState(1)
  const perPage = 6

  const types = React.useMemo(
    () => Array.from(new Set(rooms.map((r) => r.category))),
    [rooms]
  )

  const filtered = React.useMemo(() => {
    let out = rooms.slice()
    if (filters.type) out = out.filter((r) => r.category === filters.type)
    if (filters.guests) out = out.filter((r) => r.capacity >= filters.guests!)
    if (filters.priceMin !== undefined)
      out = out.filter((r) => r.pricePerNight >= (filters.priceMin || 0))
    if (filters.priceMax !== undefined)
      out = out.filter((r) => r.pricePerNight <= (filters.priceMax || Infinity))

    if (sort === 'price-asc') out.sort((a, b) => a.pricePerNight - b.pricePerNight)
    else if (sort === 'price-desc') out.sort((a, b) => b.pricePerNight - a.pricePerNight)
    return out
  }, [rooms, filters, sort])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  React.useEffect(() => setPage(1), [filters, sort])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-normal leading-[1.15] text-text">Rooms</h1>
          <p className="mt-2 text-sm text-text-muted">{total} room{total === 1 ? '' : 's'} · all from the same calm inventory</p>
        </div>
        <div className="flex items-center gap-4">
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="mb-6">
        <RoomsFilters types={types} onChange={setFilters} />
      </div>

      {rooms.length === 0 ? (
        <div className="py-20 text-center text-text-muted">
          No rooms available right now. Please check back soon.
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((r) => (
              <RoomCard key={r.id} room={r} />
            ))}
          </div>

          <Pagination page={page} total={total} perPage={perPage} onPageChange={setPage} />
          {total === 0 && (
            <p className="mt-6 text-center text-text-muted">No rooms matched your filters.</p>
          )}
        </>
      )}
    </div>
  )
}
