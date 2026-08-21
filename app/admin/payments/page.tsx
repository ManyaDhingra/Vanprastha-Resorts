"use client"

import * as React from 'react'
import { apiFetch } from '@/lib/utils'
import { formatINR } from '@/lib/utils'
import { BookingStatusBadge } from '@/components/ui/badge'

interface AdminPayment {
  id: string
  amount: number
  status: string
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  createdAt: string
  booking: {
    checkIn: string
    checkOut: string
    status: string
    room: { title: string }
    user: { name: string; email: string }
  }
}

export default function AdminPayments() {
  const [payments, setPayments] = React.useState<AdminPayment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    apiFetch<AdminPayment[]>('/api/admin/payments')
      .then(setPayments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-text-muted">Loading payments…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (payments.length === 0)
    return <p className="text-sm text-text-muted">No payments yet.</p>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Payments</h1>
        <span className="text-sm text-text-muted">{payments.length} total</span>
      </div>

      <div className="grid gap-4">
        {payments.map((p) => (
          <div key={p.id} className="rounded-xl border border-border/60 bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-text">
                    {p.booking.room.title}
                  </span>
                  <BookingStatusBadge status={p.status} />
                </div>
                <div className="mt-1 text-xs text-text-muted">
                  {p.booking.user.name} · {p.booking.user.email}
                </div>
                <div className="mt-1 text-xs text-text-muted">
                  {new Date(p.booking.checkIn).toLocaleDateString()} →{' '}
                  {new Date(p.booking.checkOut).toLocaleDateString()} · paid{' '}
                  {new Date(p.createdAt).toLocaleDateString()}
                </div>
                {p.razorpayPaymentId && (
                  <div className="mt-1 text-xs text-slate-400">
                    Razorpay: {p.razorpayPaymentId.slice(0, 20)}…
                  </div>
                )}
              </div>
              <div className="font-semibold text-text">
                {formatINR(p.amount)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
