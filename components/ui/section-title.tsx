import * as React from 'react'
import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  description: string
  className?: string
}

export function SectionTitle({ title, description, className }: SectionTitleProps) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#6B7280]">Signature stays</p>
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-slate-600">{description}</p>
    </div>
  )
}
