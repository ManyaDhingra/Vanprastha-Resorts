"use client"

import * as React from 'react'
import { BlockCards } from './block-cards'
import { RoomCard } from './room-card'
import { RoomsFilters, type RoomFilters } from './rooms-filters'
import { Pagination } from './pagination'
import { SortSelect } from './sort-select'
import type { RoomDto, BlockDto } from '@/lib/shared/types'

/**
 * Client-side browsing over a server-provided room list: filters, sort and
 * pagination without any network round-trip. Data always comes from the DB
 * via the server component (app/rooms/page.tsx).
 *
 * When no block filter is active, shows the block overview cards.
 * When a block is selected, shows its individual rooms.
 */
export function RoomsPageClient({
  rooms,
  blocks,
  initialBlock,
}: {
  rooms: RoomDto[];
  blocks: BlockDto[];
  initialBlock?: string;
}) {
  const [selectedBlock, setSelectedBlock] = React.useState<string | null>(
    initialBlock ?? null
  )
  const [filters, setFilters] = React.useState<RoomFilters>({})
  const [sort, setSort] = React.useState('recommended')
  const [page, setPage] = React.useState(1)
  const perPage = 6

  const blockRooms = React.useMemo(() => {
    if (!selectedBlock) return []
    const block = blocks.find((b) => b.slug === selectedBlock)
    if (!block) return []
    return rooms.filter((r) => r.blockId === block.id)
  }, [rooms, blocks, selectedBlock])

  const types = React.useMemo(
    () => Array.from(new Set(blockRooms.map((r) => r.category))),
    [blockRooms]
  )

  const filtered = React.useMemo(() => {
    let out = blockRooms.slice()
    if (filters.type) out = out.filter((r) => r.category === filters.type)
    if (filters.guests) out = out.filter((r) => r.capacity >= filters.guests!)
    if (filters.priceMin !== undefined)
      out = out.filter((r) => r.pricePerNight >= (filters.priceMin || 0))
    if (filters.priceMax !== undefined)
      out = out.filter((r) => r.pricePerNight <= (filters.priceMax || Infinity))

    if (sort === 'price-asc') out.sort((a, b) => a.pricePerNight - b.pricePerNight)
    else if (sort === 'price-desc') out.sort((a, b) => b.pricePerNight - a.pricePerNight)
    return out
  }, [blockRooms, filters, sort])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / perPage))
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  React.useEffect(() => setPage(1), [filters, sort, selectedBlock])

  const currentBlock = blocks.find((b) => b.slug === selectedBlock)

  return (
    <div className="mx-auto max-w-7xl px-6 pt-28 pb-12">
      {selectedBlock && currentBlock ? (
        <>
          <div className="mb-6">
            <button
              onClick={() => setSelectedBlock(null)}
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              &larr; All blocks
            </button>
            <h1 className="font-heading text-3xl font-normal leading-[1.15] text-text">
              {currentBlock.name}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {total} room{total === 1 ? '' : 's'} · {currentBlock.category} · {currentBlock.view}
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div />
            <div className="flex items-center gap-4">
              <SortSelect value={sort} onChange={setSort} />
            </div>
          </div>

          <div className="mb-6">
            <RoomsFilters types={types} onChange={setFilters} />
          </div>

          {blockRooms.length === 0 ? (
            <div className="py-20 text-center text-text-muted">
              No rooms available in this block right now.
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
        </>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-normal leading-[1.15] text-text">
              Rooms &amp; Villas
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Choose an accommodation block to explore its rooms.
            </p>
          </div>

          <BlockCards blocks={blocks} />
        </>
      )}
    </div>
  )
}
