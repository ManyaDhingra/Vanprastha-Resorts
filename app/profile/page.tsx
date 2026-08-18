"use client"

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { apiFetch } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/utils'

interface MyBooking {
  id: string
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  room: { id: string; title: string; slug: string; image: string }
  payment: { status: string; amount: number } | null
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = React.useState<MyBooking[]>([])
  const [bookingsError, setBookingsError] = React.useState<string | null>(null)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (authLoading) return
    if (!user) return
    apiFetch<MyBooking[]>('/api/bookings')
      .then(setBookings)
      .catch((e) => setBookingsError(e.message))
  }, [authLoading, user])

  async function cancelBooking(id: string) {
    if (!window.confirm('Cancel this booking? The dates will become available to others.')) return
    setCancellingId(id)
    try {
      await apiFetch(`/api/bookings/${id}`, { method: 'DELETE' })
      setBookings((list) =>
        list.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' as const } : b))
      )
    } catch (e) {
      setBookingsError(e instanceof Error ? e.message : 'Could not cancel booking.')
    } finally {
      setCancellingId(null)
    }
  }

  if (authLoading) {
    return (
      <main className="py-12">
        <div className="mx-auto max-w-md px-6 text-sm text-slate-500">Loading…</div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="py-12">
        <div className="mx-auto max-w-md px-6 text-center">
          <p className="text-slate-700">You are not logged in.</p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="mb-4 text-2xl font-semibold">Profile</h1>
        <div className="rounded-xl bg-white p-6 shadow-card">
          <div className="text-sm text-slate-600">Name</div>
          <div className="mt-1 text-lg font-medium text-slate-900">{user.name}</div>
          <div className="mt-4 text-sm text-slate-600">Email</div>
          <div className="mt-1 text-sm text-slate-900">{user.email}</div>

          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" onClick={() => { void logout(); router.push('/') }}>
              Logout
            </Button>
            <Button asChild>
              <Link href="/book">Book a stay</Link>
            </Button>
          </div>
        </div>

        <h2 className="mb-3 mt-8 text-lg font-semibold">My bookings</h2>
        {bookingsError && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {bookingsError}
          </div>
        )}
        {bookings.length === 0 ? (
          <p className="text-sm text-slate-500">
            No bookings yet.{' '}
            <Link href="/book" className="text-primary underline">
              Book your stay
            </Link>
          </p>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/rooms/${b.room.slug}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {b.room.title}
                    </Link>
                    <div className="mt-1 text-xs text-slate-500">
                      {new Date(b.checkIn).toLocaleDateString()} →{' '}
                      {new Date(b.checkOut).toLocaleDateString()} · {b.guests} guests
                    </div>
                    <span
                      className={
                        'mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ' +
                        (b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 text-emerald-800'
                          : b.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-amber-50 text-amber-800')
                      }
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {formatINR(b.totalAmount)}
                    </div>
                    {b.status === 'PENDING' && (
                      <button
                        type="button"
                        disabled={cancellingId === b.id}
                        onClick={() => void cancelBooking(b.id)}
                        className="mt-2 rounded-md border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {cancellingId === b.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}