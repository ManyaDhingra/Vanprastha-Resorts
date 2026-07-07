import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const payload = await req.json()
  const id = `BK-${Date.now().toString(36).toUpperCase()}`
  const booking = {
    id,
    roomId: payload.roomId,
    checkIn: payload.checkIn,
    checkOut: payload.checkOut,
    guests: payload.guests,
    total: payload.total || '₹0',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  }

  // In a real backend we'd persist. For the mock API, return the created booking.
  return NextResponse.json(booking, { status: 201 })
}

export async function GET() {
  // Return a small mock list for development
  const sample = [
    {
      id: 'BK-EXAMPLE1',
      roomId: 'river-pavilion-suite',
      checkIn: '2026-09-18',
      checkOut: '2026-09-22',
      guests: 2,
      total: '₹168,000',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }
  ]
  return NextResponse.json(sample)
}
