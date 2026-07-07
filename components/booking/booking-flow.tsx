"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { fetchRooms } from '@/lib/fetchers'

type Step = 1 | 2 | 3 | 4 | 5

export function BookingFlow() {
  const [step, setStep] = React.useState<Step>(1)
  const [rooms, setRooms] = React.useState<any[]>([])
  const [selectedRoom, setSelectedRoom] = React.useState<string | null>(null)
  const [checkIn, setCheckIn] = React.useState('')
  const [checkOut, setCheckOut] = React.useState('')
  const [guests, setGuests] = React.useState(2)
  const [bookingResponse, setBookingResponse] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    fetch('/api/rooms')
      .then((r) => r.json())
      .then((data) => mounted && setRooms(data))
    return () => { mounted = false }
  }, [])

  const subtotal = React.useMemo(() => {
    if (!selectedRoom) return '₹0'
    const room = rooms.find((r) => r.id === selectedRoom)
    if (!room) return '₹0'
    // simple parse price
    const digits = room.pricePerNight.replace(/[^0-9]/g, '')
    const nights = (new Date(checkOut).valueOf() - new Date(checkIn).valueOf()) / (1000 * 60 * 60 * 24) || 1
    return `₹${Number(digits) * Math.max(1, nights)}`
  }, [selectedRoom, rooms, checkIn, checkOut])

  async function submitBooking() {
    setLoading(true)
    try {
      const payload = { roomId: selectedRoom, checkIn, checkOut, guests, total: subtotal }
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      setBookingResponse(data)
      setStep(5)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-soft">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Reserve your stay</h2>
        <div className="text-sm text-slate-600">Step {step} of 5</div>
      </div>

      {step === 1 && (
        <div className="grid gap-4">
          <label className="text-sm text-slate-600">Check-in</label>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2" />
          <label className="text-sm text-slate-600">Check-out</label>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2" />
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setStep(2)}>Continue</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <label className="text-sm text-slate-600">Guests</label>
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="rounded-md border border-slate-200 px-3 py-2">
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>

          <label className="text-sm text-slate-600">Select room</label>
          <select value={selectedRoom || ''} onChange={(e) => setSelectedRoom(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2">
            <option value="">Choose a room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.title} — {r.pricePerNight}</option>
            ))}
          </select>

          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!selectedRoom}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4">
          <h3 className="text-sm font-medium text-slate-600">Review booking</h3>
          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <div className="text-sm text-slate-700">Room: <strong>{rooms.find((r) => r.id === selectedRoom)?.title}</strong></div>
            <div className="text-sm text-slate-700">Dates: {checkIn} → {checkOut}</div>
            <div className="text-sm text-slate-700">Guests: {guests}</div>
            <div className="mt-3 text-sm font-semibold">Estimated total: {subtotal}</div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={() => setStep(4)}>Proceed to payment</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-4">
          <h3 className="text-sm font-medium text-slate-600">Payment</h3>
          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <p className="text-sm text-slate-700">This is a payment placeholder. No real payment is processed.</p>
            <label className="mt-3 block text-sm text-slate-600">Card number</label>
            <input className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" placeholder="4242 4242 4242 4242" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input className="rounded-md border border-slate-200 px-3 py-2" placeholder="MM/YY" />
              <input className="rounded-md border border-slate-200 px-3 py-2" placeholder="CVC" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
            <Button onClick={submitBooking} disabled={loading}>{loading ? 'Processing…' : 'Pay & confirm'}</Button>
          </div>
        </div>
      )}

      {step === 5 && bookingResponse && (
        <div className="grid gap-4">
          <h3 className="text-sm font-medium text-slate-600">Confirmation</h3>
          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <div className="text-sm text-slate-700">Booking ID: <strong>{bookingResponse.id}</strong></div>
            <div className="text-sm text-slate-700">Status: <strong>{bookingResponse.status}</strong></div>
            <div className="mt-3 text-sm">A confirmation email will be sent shortly (mock).</div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => {
              // reset to beginning for demo
              setStep(1)
              setSelectedRoom(null)
              setCheckIn('')
              setCheckOut('')
              setGuests(2)
              setBookingResponse(null)
            }}>New booking</Button>
          </div>
        </div>
      )}
    </div>
  )
}
