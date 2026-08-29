"use client"

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'

export default function RegisterForm() {
  const { register, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next')
  const next =
    typeof nextParam === 'string' &&
    nextParam.startsWith('/') &&
    !nextParam.startsWith('//')
      ? nextParam
      : null
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (!authLoading && user) router.replace(next ?? '/')
  }, [authLoading, user, router, next])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(name, email, password)
      router.replace(next ?? '/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Form always renders; session restore happens in the background and an
  // already-authenticated visitor is redirected once it settles.
  return (
    <main className="pt-28 pb-12">
      <div className="mx-auto max-w-md px-6">
        <h1 className="mb-4 text-2xl font-semibold">Create an account</h1>
        <form onSubmit={submit} className="grid gap-4">
          <label className="text-sm text-text-muted">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-md border border-border px-3 py-2" />

          <label className="text-sm text-text-muted">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="rounded-md border border-border px-3 py-2" />

          <label className="text-sm text-text-muted">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="rounded-md border border-border px-3 py-2" />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
