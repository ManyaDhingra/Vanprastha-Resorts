"use client"

import * as React from 'react'
import { apiFetch } from '@/lib/utils'

interface AdminUser {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  createdAt: string
  _count: { bookings: number }
}

export default function AdminUsers() {
  const [users, setUsers] = React.useState<AdminUser[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)

  const load = () => {
    setLoading(true)
    apiFetch<AdminUser[]>('/api/admin/users')
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  React.useEffect(load, [])

  async function toggleRole(user: AdminUser) {
    if (user.role === 'ADMIN') {
      const confirmed = window.confirm(
        `Demote ${user.email} to a regular user?`
      )
      if (!confirmed) return
    }
    setBusyId(user.id)
    setError(null)
    try {
      await apiFetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' }),
      })
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading users…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Users</h1>
        <span className="text-sm text-slate-500">{users.length} total</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Bookings</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">{u.phone ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{u._count.bookings}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.role === 'ADMIN'
                        ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'
                        : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600'
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => void toggleRole(u)}
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {busyId === u.id ? '…' : u.role === 'ADMIN' ? 'Demote' : 'Make admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}