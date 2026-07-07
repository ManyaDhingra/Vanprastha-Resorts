"use client"

import * as React from 'react'

interface Props {
  page: number
  total: number
  perPage: number
  onPageChange: (p: number) => void
}

export function Pagination({ page, total, perPage, onPageChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / perPage))

  return (
    <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
      <button onClick={() => onPageChange(Math.max(1, page - 1))} className="rounded px-3 py-1 text-sm" disabled={page <= 1}>Previous</button>
      <span className="text-sm text-slate-600">Page {page} of {pages}</span>
      <button onClick={() => onPageChange(Math.min(pages, page + 1))} className="rounded px-3 py-1 text-sm" disabled={page >= pages}>Next</button>
    </nav>
  )
}
