"use client"

import * as React from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <main className="py-12">
        <div className="mx-auto max-w-md px-6 text-center">
          <p className="text-slate-700">You are not logged in.</p>
          <div className="mt-4">
            <Button asChild>
              <a href="/login">Login</a>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="py-12">
      <div className="mx-auto max-w-md px-6">
        <h1 className="mb-4 text-2xl font-semibold">Profile</h1>
        <div className="rounded-xl bg-white p-6 shadow-card">
          <div className="text-sm text-slate-600">Name</div>
          <div className="mt-1 text-lg font-medium text-slate-900">{user.name}</div>
          <div className="mt-4 text-sm text-slate-600">Email</div>
          <div className="mt-1 text-sm text-slate-900">{user.email}</div>

          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" onClick={() => { logout(); router.push('/') }}>Logout</Button>
          </div>
        </div>
      </div>
    </main>
  )
}
