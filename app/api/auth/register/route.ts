import { NextResponse } from 'next/server'
import { createUser, findUserByEmail } from '@/data/users'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const existing = findUserByEmail(email)
  if (existing) return NextResponse.json({ error: 'User already exists' }, { status: 409 })
  const user = createUser({ name, email, password })
  const safe = { id: user.id, name: user.name, email: user.email, token: user.token }
  return NextResponse.json(safe, { status: 201 })
}
