import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json()
  // In a real app we'd generate a reset token and send email. For mock, accept any email.
  return NextResponse.json({ ok: true, message: `If ${email} exists, a reset link has been sent (mock).` })
}
