import { NextResponse } from 'next/server'
import { users } from '@/data/users'

export async function GET() {
  const safe = users.map((u) => ({ id: u.id, name: u.name, email: u.email }))
  return NextResponse.json(safe)
}
