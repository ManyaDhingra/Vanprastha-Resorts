"use client"

import * as React from 'react'

export default function AdminUsers() {
  const [users, setUsers] = React.useState<any[]>([])

  React.useEffect(() => {
    fetch('/api/admin/users').then((r) => r.json()).then(setUsers)
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Users</h1>
      </div>

      <div className="grid gap-4">
        {users.map((u) => (
          <div key={u.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-card flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900">{u.name}</div>
              <div className="text-xs text-slate-600">{u.email}</div>
            </div>
            <div className="text-sm text-slate-700">Member</div>
          </div>
        ))}
      </div>
    </div>
  )
}
