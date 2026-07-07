"use client"

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await register(name, email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-md px-6">
        <h1 className="mb-4 text-2xl font-semibold">Create an account</h1>
        <form onSubmit={submit} className="grid gap-4">
          <label className="text-sm text-slate-600">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="rounded-md border border-slate-200 px-3 py-2" />

          <label className="text-sm text-slate-600">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="rounded-md border border-slate-200 px-3 py-2" />

          <label className="text-sm text-slate-600">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="rounded-md border border-slate-200 px-3 py-2" />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end">
            <Button type="submit">Create account</Button>
          </div>
        </form>
      </div>
    </main>
  )
}
