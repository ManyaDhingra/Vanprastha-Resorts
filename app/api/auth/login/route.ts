import { NextResponse } from 'next/server'
import { findUserByEmail } from '@/data/users'

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const user = findUserByEmail(email)
  if (!user || user.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const safe = { id: user.id, name: user.name, email: user.email, token: user.token }
  return NextResponse.json(safe)
}
