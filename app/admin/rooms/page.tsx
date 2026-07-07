"use client"

import * as React from 'react'
import { RoomCard } from '@/components/rooms/room-card'

export default function AdminRooms() {
  const [rooms, setRooms] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch('/api/rooms').then((r) => r.json()).then(setRooms)
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Rooms</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <RoomCard key={r.id} room={r} />
        ))}
      </div>
    </div>
  )
}
