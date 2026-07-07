import { NextResponse } from 'next/server'
import { findUserByToken } from '@/data/users'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  const user = findUserByToken(token)
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const safe = { id: user.id, name: user.name, email: user.email }
  return NextResponse.json(safe)
}
