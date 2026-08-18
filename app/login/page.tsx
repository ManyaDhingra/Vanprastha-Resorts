"use client"

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!authLoading && user) router.replace('/')
  }, [authLoading, user, router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      router.replace(user?.role === 'ADMIN' ? '/admin' : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <main className="py-12">
        <div className="mx-auto max-w-md px-6 text-sm text-slate-500">Loading…</div>
      </main>
    )
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-md px-6">
        <h1 className="mb-4 text-2xl font-semibold">Login</h1>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm text-slate-600">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-slate-200 px-3 py-2"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm text-slate-600">Password</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-slate-200 px-3 py-2"
            />
          </div>

          {error && <div className="text-sm text-red-600" role="alert">{error}</div>}

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              New here?{' '}
              <Link href="/register" className="text-primary underline">
                Create an account
              </Link>
            </p>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Login'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}