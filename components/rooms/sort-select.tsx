"use client"

import * as React from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function SortSelect({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-slate-600">Sort</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-md border border-slate-200 px-3 py-2 text-sm">
        <option value="recommended">Recommended</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  )
}
