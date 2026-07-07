"use client"

import * as React from 'react'
import { Button } from '@/components/ui/button'

export default function ForgotPage() {
  const [email, setEmail] = React.useState('')
  const [sent, setSent] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    setSent(true)
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-md px-6">
        <h1 className="mb-4 text-2xl font-semibold">Forgot password</h1>
        {sent ? (
          <div className="rounded-xl bg-white p-6 shadow-card">If the email exists, a reset link was sent (mock).</div>
        ) : (
          <form onSubmit={submit} className="grid gap-4">
            <label className="text-sm text-slate-600">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="rounded-md border border-slate-200 px-3 py-2" />
            <div className="flex justify-end">
              <Button type="submit">Send reset link</Button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
