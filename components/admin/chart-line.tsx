"use client"

import * as React from 'react'

export function LineChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" className="w-full h-40">
      <polyline points={points} fill="none" stroke="#234E70" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
