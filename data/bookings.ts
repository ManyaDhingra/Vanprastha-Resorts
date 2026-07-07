export interface Booking {
  id: string
  roomId: string
  checkIn: string
  checkOut: string
  guests: number
  total: string
  status: 'pending' | 'confirmed'
  createdAt: string
}

export const bookings: Booking[] = []
