"use client"

import * as React from 'react'

export default function AdminSettings() {
  const [siteTitle, setSiteTitle] = React.useState('Vanprastha Resorts')

  const save = () => {
    alert('Settings saved (mock)')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Settings</h1>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-card max-w-2xl">
        <label className="text-sm text-slate-600">Site title</label>
        <input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2" />
        <div className="mt-4">
          <button onClick={save} className="rounded bg-primary px-4 py-2 text-white">Save</button>
        </div>
      </div>
    </div>
  )
}
