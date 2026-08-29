"use client"

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'

export default function LoginForm() {
  const { login, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  // ?next= lets the booking flow return the user here after login instead of
  // dropping them at the homepage. Only same-site paths are honored.
  const nextParam = searchParams.get('next')
  const next =
    typeof nextParam === 'string' &&
    nextParam.startsWith('/') &&
    !nextParam.startsWith('//')
      ? nextParam
      : null
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  // Session restore runs in the background; the form is ALWAYS rendered so
  // a hung/slow /api/auth/me can never strand the page on "Loading…".
  // Redirect happens only once restoration has actually settled.
  React.useEffect(() => {
    if (!authLoading && user) router.replace(next ?? (user.role === 'ADMIN' ? '/admin' : '/'))
  }, [authLoading, user, router, next])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // login() resolves with the fresh user — the same-render closure above
      // is stale, so never read `user` for the redirect target.
      const loggedIn = await login(email, password)
      router.replace(next ?? (loggedIn.role === 'ADMIN' ? '/admin' : '/'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="pt-28 pb-12">
      <div className="mx-auto max-w-md px-6">
        <h1 className="mb-4 text-2xl font-semibold">Login</h1>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm text-text-muted">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-border px-3 py-2"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm text-text-muted">Password</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-border px-3 py-2"
            />
          </div>

          {error && <div className="text-sm text-red-600" role="alert">{error}</div>}

          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
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
