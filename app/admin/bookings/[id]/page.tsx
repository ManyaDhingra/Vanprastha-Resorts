"use client"

import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { apiFetch, formatINR } from '@/lib/utils'
import { BookingStatusBadge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Mail, Phone, CreditCard, Calendar, Users, BedDouble } from 'lucide-react'

interface BookingDetail {
  id: string
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  status: string
  createdAt: string
  room: {
    id: string
    title: string
    category: string
    slug: string
    pricePerNight: number
    capacity: number
    size: number
    block: string | null
    blockRelation: { id: string; name: string; slug: string } | null
  }
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
  payment: {
    id: string
    amount: number
    status: string
    razorpayOrderId: string | null
    razorpayPaymentId: string | null
    refundId: string | null
    createdAt: string
  } | null
}

function calculateNights(checkIn: string, checkOut: string): number {
  const inMs = new Date(checkIn).getTime()
  const outMs = new Date(checkOut).getTime()
  return Math.max(1, Math.ceil((outMs - inMs) / (1000 * 60 * 60 * 24)))
}

export default function BookingDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [booking, setBooking] = React.useState<BookingDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [cancelling, setCancelling] = React.useState(false)
  const [refunding, setRefunding] = React.useState(false)

  React.useEffect(() => {
    apiFetch<BookingDetail>(`/api/admin/bookings/${id}`)
      .then(setBooking)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function cancelBooking() {
    if (!window.confirm('Cancel this booking? This releases the dates. Cancellation cannot be undone.')) return
    setCancelling(true)
    try {
      await apiFetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      const updated = await apiFetch<BookingDetail>(`/api/admin/bookings/${id}`)
      setBooking(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  async function refundBooking() {
    if (!window.confirm('Initiate a refund for this booking? The amount will be returned to the guest via Razorpay.')) return
    setRefunding(true)
    try {
      await apiFetch('/api/admin/refunds', {
        method: 'POST',
        body: JSON.stringify({ bookingId: id }),
      })
      const updated = await apiFetch<BookingDetail>(`/api/admin/bookings/${id}`)
      setBooking(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process refund.')
    } finally {
      setRefunding(false)
    }
  }

  if (loading) return <p className="text-sm text-text-muted">Loading booking details…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!booking) return <p className="text-sm text-text-muted">Booking not found.</p>

  const nights = calculateNights(booking.checkIn, booking.checkOut)

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/bookings"
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="font-heading text-2xl font-semibold">Booking Details</h1>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Guest Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-text-muted">Name</p>
              <p className="font-medium text-text">{booking.user.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-text-muted" />
              <p className="text-sm text-text-muted">{booking.user.email}</p>
            </div>
            {booking.user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-text-muted" />
                <p className="text-sm text-text-muted">{booking.user.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stay Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Stay Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted">Check-in</p>
                <p className="font-medium text-text">
                  {new Date(booking.checkIn).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Check-out</p>
                <p className="font-medium text-text">
                  {new Date(booking.checkOut).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3 text-text-muted" />
              <p className="text-sm text-text-muted">{booking.guests} guest{booking.guests > 1 ? 's' : ''} · {nights} night{nights > 1 ? 's' : ''}</p>
            </div>
          </CardContent>
        </Card>

        {/* Room Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BedDouble className="h-4 w-4" />
              Room Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-text-muted">Room</p>
              <Link href={`/admin/rooms`} className="font-medium text-text hover:underline">
                {booking.room.title}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-text-muted">Category</p>
                <p className="text-text">{booking.room.category}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Block</p>
                <p className="text-text">{booking.room.blockRelation?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Capacity</p>
                <p className="text-text">{booking.room.capacity} guests</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Size</p>
                <p className="text-text">{booking.room.size} sq ft</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment & Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted">Total Amount</p>
                <p className="text-lg font-semibold text-text">{formatINR(booking.totalAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Rate per Night</p>
                <p className="text-text">{formatINR(booking.room.pricePerNight)}</p>
              </div>
            </div>
            {booking.payment && (
              <>
                <div className="border-t border-border/60 pt-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-text-muted">Payment Status</p>
                    <BookingStatusBadge status={booking.payment.status} />
                  </div>
                </div>
                {booking.payment.razorpayPaymentId && (
                  <div>
                    <p className="text-xs text-text-muted">Razorpay Payment ID</p>
                    <p className="font-mono text-xs text-text-muted">{booking.payment.razorpayPaymentId}</p>
                  </div>
                )}
                {booking.payment.refundId && (
                  <div>
                    <p className="text-xs text-text-muted">Refund ID</p>
                    <p className="font-mono text-xs text-text-muted">{booking.payment.refundId}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-text-muted">
              Booking ID: <span className="font-mono">{booking.id}</span>
            </div>
            <div className="text-xs text-text-muted">
              Created: {new Date(booking.createdAt).toLocaleString('en-IN')}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {booking.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => void cancelBooking()}
                  disabled={cancelling}
                  className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling…' : 'Cancel Booking'}
                </button>
              )}
              {booking.status === 'CONFIRMED' && booking.payment?.status === 'SUCCESS' && (
                <button
                  type="button"
                  onClick={() => void refundBooking()}
                  disabled={refunding}
                  className="rounded-md border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                >
                  {refunding ? 'Processing…' : 'Refund & Cancel'}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
