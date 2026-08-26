"use client"

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { apiFetch, calculateNights, formatINR, todayIST } from '@/lib/utils'
import type { RoomDto, BookingDto } from '@/lib/shared/types'

type Step = 1 | 2 | 3 | 4 | 5

type Availability = 'idle' | 'checking' | 'available' | 'unavailable' | 'error'
type PayPhase = 'idle' | 'creating' | 'paying' | 'verifying' | 'success' | 'unconfigured' | 'error'

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string
      amount: number
      currency: string
      name: string
      description?: string
      order_id: string
      handler: (response: {
        razorpay_order_id: string
        razorpay_payment_id: string
        razorpay_signature: string
      }) => void
      modal?: { ondismiss: () => void }
      prefill?: { name?: string; email?: string; contact?: string }
      theme?: { color?: string }
    }) => { open: () => void }
  }
}

function todayISO() {
  return todayIST() // resort-timezone "today" — matches server validation
}

function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function BookingFlow() {
  const router = useRouter()
  const { user, token, loading: authLoading } = useAuth()
  const [step, setStep] = React.useState<Step>(1)
  const [rooms, setRooms] = React.useState<RoomDto[]>([])
  const [roomsError, setRoomsError] = React.useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = React.useState<string>('')
  const [checkIn, setCheckIn] = React.useState('')
  const [checkOut, setCheckOut] = React.useState('')
  const [guests, setGuests] = React.useState(2)
  const [availability, setAvailability] = React.useState<Availability>('idle')
  const [payPhase, setPayPhase] = React.useState<PayPhase>('idle')
  const [booking, setBooking] = React.useState<BookingDto | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const busyRef = React.useRef(false)

  React.useEffect(() => {
    let mounted = true
    apiFetch<RoomDto[]>('/api/rooms')
      .then((data) => {
        if (!mounted) return
        setRooms(data)
        // Apply URL preselects (from hero card / room cards / detail sidebar).
        const params = new URLSearchParams(window.location.search)
        const roomParam = params.get('room') ?? ''
        const room = data.find(
          (r) => r.slug === roomParam || r.id === roomParam
        )
        if (room) setSelectedRoomId(room.id)
        const checkInParam = params.get('checkIn')
        const checkOutParam = params.get('checkOut')
        const guestsParam = params.get('guests')
        if (checkInParam) setCheckIn(checkInParam)
        if (checkOutParam) setCheckOut(checkOutParam)
        const g = Number(guestsParam)
        if (Number.isInteger(g) && g >= 1 && g <= 6) setGuests(g)
      })
      .catch((e) => mounted && setRoomsError(e.message))
    return () => { mounted = false }
  }, [])

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) ?? null

  const datesValid = React.useMemo(() => {
    if (!checkIn || !checkOut) return false
    const today = todayISO()
    return checkIn >= today && checkOut > checkIn
  }, [checkIn, checkOut])

  const nights = React.useMemo(
    () => (datesValid ? calculateNights(checkIn, checkOut) : 0),
    [datesValid, checkIn, checkOut]
  )

  const total = React.useMemo(
    () => (selectedRoom ? nights * selectedRoom.pricePerNight : 0),
    [selectedRoom, nights]
  )

  React.useEffect(() => {
    // Re-check availability whenever the selection changes.
    setAvailability('idle')
  }, [selectedRoomId, checkIn, checkOut])

  async function checkAvailability() {
    if (!selectedRoom || !datesValid) return
    setAvailability('checking')
    try {
      const data = await apiFetch<{ available: boolean }>(
        `/api/availability?roomId=${selectedRoom.id}&checkIn=${checkIn}&checkOut=${checkOut}`
      )
      setAvailability(data.available ? 'available' : 'unavailable')
    } catch {
      setAvailability('error')
    }
  }

  async function startPayment() {
    if (busyRef.current || !selectedRoom || !datesValid) return
    busyRef.current = true
    setError(null)
    setPayPhase('creating')

    try {
      // 1. Create the booking (PENDING) — the server computes the amount.
      const created = await apiFetch<BookingDto>('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn,
          checkOut,
          guests,
        }),
      })
      setBooking(created)

      // 2. Create the Razorpay order.
      let order: { orderId: string; amount: number; currency: string }
      try {
        order = await apiFetch<{ orderId: string; amount: number; currency: string }>(
          '/api/payment/create-order',
          {
            method: 'POST',
            body: JSON.stringify({ bookingId: created.id }),
          }
        )
      } catch (e) {
        if (e instanceof Error && e.message.includes('not configured')) {
          // Payments backend disabled (no Razorpay keys) — the booking is
          // still real and PENDING; the resort contacts the guest.
          setPayPhase('unconfigured')
          return
        }
        throw e
      }

      // 3. Load checkout.js and open Razorpay.
      setPayPhase('paying')
      const loaded = await loadRazorpayScript()
      if (!loaded || !window.Razorpay) {
        throw new Error('Could not load the payment gateway. Please retry.')
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: order.amount,
        currency: order.currency,
        name: 'Vanprastha Resorts',
        description: `Stay at ${selectedRoom.title}`,
        order_id: order.orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#1E3A2D' },
        modal: {
          ondismiss: () => {
            // Payment aborted — booking remains PENDING; allow retry.
            setPayPhase('idle')
          },
        },
        handler: async (response) => {
          setPayPhase('verifying')
          try {
            await apiFetch('/api/payment/verify', {
              method: 'POST',
              body: JSON.stringify(response),
            })
            // Go to dedicated confirmation page (shareable, bookmarkable)
            router.push(`/book/confirmation?id=${created.id}`)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Payment verification failed.')
            setPayPhase('idle')
          }
        },
      })
      razorpay.open()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Something went wrong. Please retry.'
      )
      setPayPhase('idle')
    } finally {
      busyRef.current = false
    }
  }

  function reset() {
    setStep(1)
    setSelectedRoomId('')
    setCheckIn('')
    setCheckOut('')
    setGuests(2)
    setAvailability('idle')
    setPayPhase('idle')
    setBooking(null)
    setError(null)
  }

  return (
    <div className="mx-auto max-w-3xl rounded-2xl bg-surface p-6 shadow-soft">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Reserve your stay</h2>
        <div className="text-sm text-text-muted">Step {step} of 5</div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="check-in" className="text-sm text-text-muted">
              Check-in
            </label>
            <input
              id="check-in"
              type="date"
              min={todayISO()}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="check-out" className="text-sm text-text-muted">
              Check-out
            </label>
            <input
              id="check-out"
              type="date"
              min={checkIn || todayISO()}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="rounded-md border border-border px-3 py-2"
            />
          </div>
          {checkIn && checkOut && !datesValid && (
            <p className="text-sm text-red-600">
              Check-out must be after check-in, and dates cannot be in the past.
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!datesValid}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="guests" className="text-sm text-text-muted">
              Guests
            </label>
            <select
              id="guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="rounded-md border border-border px-3 py-2"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="room" className="text-sm text-text-muted">
              Select room
            </label>
            {roomsError ? (
              <p className="text-sm text-red-600">
                Could not load rooms: {roomsError}
              </p>
            ) : (
              <select
                id="room"
                value={selectedRoomId}
                onChange={(e) => {
                  setSelectedRoomId(e.target.value)
                  setGuests((g) => Math.min(g, 6))
                }}
                className="rounded-md border border-border px-3 py-2"
              >
                <option value="">Choose a room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id} disabled={guests > r.capacity}>
                    {r.title} — {formatINR(r.pricePerNight)}/night
                    {r.capacity ? ` (up to ${r.capacity} guests)` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedRoom && guests > selectedRoom.capacity && (
            <p className="text-sm text-red-600">
              This room allows a maximum of {selectedRoom.capacity} guests.
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button
              onClick={() => {
                setStep(3)
                void checkAvailability()
              }}
              disabled={!selectedRoom || !selectedRoomId || guests > selectedRoom.capacity}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && selectedRoom && (
        <div className="grid gap-4">
          <h3 className="text-sm font-medium text-text-muted">Review booking</h3>
          <div className="rounded-lg border border-border/60 bg-surface p-4">
            <div className="text-sm text-text-muted">
              Room: <strong>{selectedRoom.title}</strong> ({selectedRoom.category})
            </div>
            <div className="text-sm text-text-muted">Dates: {checkIn} → {checkOut}</div>
            <div className="text-sm text-text-muted">Guests: {guests}</div>
            <div className="text-sm text-text-muted">Nights: {nights}</div>
            <div className="mt-3 text-sm font-semibold">
              Total: {formatINR(total)}
              <span className="ml-2 font-normal text-text-muted">
                ({formatINR(selectedRoom.pricePerNight)} × {nights} nights)
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 p-4 text-sm">
            {availability === 'checking' && (
              <p className="text-text-muted">Checking availability…</p>
            )}
            {availability === 'available' && (
              <p className="text-emerald-700">✓ Available for your dates</p>
            )}
            {availability === 'unavailable' && (
              <p className="text-red-700">
                Sorry, this room is not available for your dates. Try different
                dates or another room.
              </p>
            )}
            {availability === 'error' && (
              <p className="text-amber-700">
                Could not check availability right now. You may still continue;
                the system will reject unavailable dates.
              </p>
            )}
            {availability === 'idle' && (
              <button
                type="button"
                onClick={() => void checkAvailability()}
                className="text-primary underline"
              >
                Check availability
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button
              onClick={() => setStep(4)}
              disabled={availability !== 'available'}
            >
              Proceed to payment
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-4">
          <h3 className="text-sm font-medium text-text-muted">Payment</h3>

          {!user && (() => {
            const nextParams = new URLSearchParams()
            if (checkIn) nextParams.set('checkIn', checkIn)
            if (checkOut) nextParams.set('checkOut', checkOut)
            if (guests) nextParams.set('guests', String(guests))
            if (selectedRoomId) {
              const rm = rooms.find((r) => r.id === selectedRoomId)
              nextParams.set('room', rm?.slug ?? selectedRoomId)
            }
            const nextUrl = `/book?${nextParams.toString()}`
            return (
              <div className="rounded-lg border border-border/60 bg-surface p-4 text-sm">
                <p className="text-text-muted">
                  Please{' '}
                  <Link href={`/login?next=${encodeURIComponent(nextUrl)}`} className="font-medium text-primary underline">
                    log in
                  </Link>{' '}
                  or{' '}
                  <Link href={`/register?next=${encodeURIComponent(nextUrl)}`} className="font-medium text-primary underline">
                    create an account
                  </Link>{' '}
                  to pay for your stay. Your selected dates and room will be saved — you’ll return here to complete payment.
                </p>
              </div>
            )
          })()}

          {user && (
            <>
              <div className="rounded-lg border border-border/60 bg-surface p-4 text-sm">
                <div className="text-text-muted">
                  Room: <strong>{selectedRoom?.title}</strong>
                </div>
                <div className="text-text-muted">Dates: {checkIn} → {checkOut}</div>
                <div className="text-text-muted">Guests: {guests}</div>
                <div className="mt-2 font-semibold text-text">
                  Total due: {formatINR(total)}
                </div>
              </div>

              {payPhase === 'unconfigured' && booking && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p>
                    Online payment is temporarily unavailable. Your booking
                    ({booking.id}) has been received as pending and our team
                    will contact you to complete payment.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Button onClick={() => router.push(`/book/confirmation?id=${booking.id}`)}>See confirmation</Button>
                  </div>
                </div>
              )}

              {payPhase !== 'unconfigured' && (
                <div className="rounded-lg border border-border/60 bg-surface p-4 text-sm text-text-muted">
                  <p>
                    You will be redirected to Razorpay&apos;s secure
                    checkout to complete the payment.
                  </p>
                  {authLoading && <p className="mt-2">Loading account…</p>}
                  {!authLoading && !token && (
                    <p className="mt-2 text-amber-700">
                      No active session. Please log in again.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(3)} disabled={payPhase === 'creating' || payPhase === 'paying' || payPhase === 'verifying'}>
                  Back
                </Button>
                {payPhase !== 'unconfigured' && (
                  <Button
                    onClick={() => void startPayment()}
                    disabled={
                      !token || authLoading || payPhase === 'creating' || payPhase === 'paying' || payPhase === 'verifying'
                    }
                  >
                    {payPhase === 'creating' && 'Creating booking…'}
                    {payPhase === 'paying' && 'Opening secure checkout…'}
                    {payPhase === 'verifying' && 'Verifying payment…'}
                    {(payPhase === 'idle' || payPhase === 'error') && 'Pay & confirm'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {step === 5 && booking && (
        <div className="grid gap-4">
          <h3 className="text-sm font-medium text-text-muted">
            {payPhase === 'success'
              ? 'Payment confirmed — stay booked!'
              : 'Reservation received'}
          </h3>
          <div className="rounded-lg border border-border/60 bg-surface p-4">
            <div className="text-sm text-text-muted">
              Booking ID: <strong>{booking.id}</strong>
            </div>
            <div className="text-sm text-text-muted">
              Status: <strong>{booking.status}</strong>
            </div>
            <div className="text-sm text-text-muted">
              Total: <strong>{formatINR(booking.totalAmount)}</strong>
            </div>
            <div className="mt-3 text-sm">
              {payPhase === 'success' ? (
                <p className="text-text-muted">
                  A confirmation of your stay has been recorded. Manage it from
                  your profile.
                </p>
              ) : (
                <p className="text-amber-800">
                  Payment pending. Our team will contact you to complete the
                  payment and confirm your stay.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={reset}>New booking</Button>
            <Button asChild>
              <Link href="/profile">View my bookings</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
