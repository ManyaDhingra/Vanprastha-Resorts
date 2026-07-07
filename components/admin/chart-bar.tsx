"use client"

import * as React from 'react'

export function BarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((v, i) => (
        <div key={i} className="w-full" style={{ flex: 1 }}>
          <div className="mx-auto h-full max-w-[24px]" style={{ height: `${(v / max) * 100}%` }}>
            <div className="h-full rounded-t-md bg-primary" />
          </div>
        </div>
      ))}
    </div>
  )
}
