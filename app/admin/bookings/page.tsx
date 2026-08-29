"use client"

import * as React from 'react'
import Link from 'next/link'
import { apiFetch, formatINR } from '@/lib/utils'
import { BookingStatusBadge } from '@/components/ui/badge'
import { Search, Filter } from 'lucide-react'

interface AdminBooking {
  id: string
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  status: string
  createdAt: string
  user: { name: string; email: string }
  room: { title: string; category: string; blockRelation: { id: string; name: string; slug: string } | null }
  payment: { status: string; amount: number } | null
}

interface BookingsResponse {
  bookings: AdminBooking[]
  total: number
  page: number
  limit: number
}

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const

export default function AdminBookings() {
  const [data, setData] = React.useState<BookingsResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)

  const [statusFilter, setStatusFilter] = React.useState<string>('ALL')
  const [search, setSearch] = React.useState('')
  const [searchInput, setSearchInput] = React.useState('')
  const [page, setPage] = React.useState(1)

  const load = React.useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (search) params.set('search', search)

    apiFetch<BookingsResponse>(`/api/admin/bookings?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, statusFilter, search])

  React.useEffect(load, [load])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  async function cancelBooking(id: string) {
    if (!window.confirm('Cancel this booking? This releases the dates. Cancellation cannot be undone.')) return
    setCancellingId(id)
    try {
      await apiFetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      setError(null)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel booking.')
    } finally {
      setCancellingId(null)
    }
  }

  const bookings = data?.bookings ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Bookings</h1>
        <span className="text-sm text-text-muted">{total} total</span>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by guest, email, or room..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Search
          </button>
        </form>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted" />
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === s
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-muted hover:bg-secondary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-text-muted">No bookings match your filters.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/60 bg-surface shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs text-text-muted">
                  <th className="px-4 py-3 font-medium">Guest</th>
                  <th className="px-4 py-3 font-medium">Room</th>
                  <th className="px-4 py-3 font-medium">Check-in</th>
                  <th className="px-4 py-3 font-medium">Check-out</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">{b.user.name}</div>
                      <div className="text-xs text-text-muted">{b.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-text">{b.room.title}</div>
                      <div className="text-xs text-text-muted">{b.room.blockRelation?.name ?? b.room.category}</div>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(b.checkIn).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(b.checkOut).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-medium text-text">
                      {formatINR(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={b.status} />
                      {b.payment && (
                        <span className="ml-1">
                          <BookingStatusBadge status={`PAY:${b.payment.status}`} />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </Link>
                      {b.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => void cancelBooking(b.id)}
                          disabled={cancellingId === b.id}
                          className="ml-2 rounded-md border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {cancellingId === b.id ? '…' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-xs text-text-muted">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted hover:bg-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
