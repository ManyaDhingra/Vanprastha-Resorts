"use client"

import * as React from 'react'
import { apiFetch } from '@/lib/utils'
import { formatINR } from '@/lib/utils'
import { BookingStatusBadge } from '@/components/ui/badge'

interface AdminBooking {
  id: string
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  status: string
  user: { name: string; email: string }
  room: { title: string; category: string }
  payment: { status: string; amount: number } | null
}

export default function AdminBookings() {
  const [bookings, setBookings] = React.useState<AdminBooking[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)

  const load = React.useCallback(() => {
    apiFetch<AdminBooking[]>('/api/admin/bookings')
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  React.useEffect(load, [load])

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

  if (loading) return <p className="text-sm text-text-muted">Loading bookings…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (bookings.length === 0)
    return <p className="text-sm text-text-muted">No bookings yet.</p>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Bookings</h1>
        <span className="text-sm text-text-muted">{bookings.length} total</span>
      </div>

      <div className="grid gap-4">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-xl border border-border/60 bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-text">{b.room.title}</span>
                  <BookingStatusBadge status={b.status} />
                  {b.payment && <BookingStatusBadge status={`PAY:${b.payment.status}`} />}
                </div>
                <div className="mt-1 text-xs text-text-muted">
                  {new Date(b.checkIn).toLocaleDateString()} →{' '}
                  {new Date(b.checkOut).toLocaleDateString()} · {b.guests} guests
                </div>
                <div className="mt-1 text-xs text-text-muted">
                  {b.user.name} · {b.user.email}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-text">
                  {formatINR(b.totalAmount)}
                </div>
                <div className="text-xs text-slate-400">{b.id.slice(-8)}</div>
              </div>
            </div>
            {b.status === 'PENDING' && (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => void cancelBooking(b.id)}
                  disabled={cancellingId === b.id}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {cancellingId === b.id ? 'Cancelling…' : 'Cancel booking'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
