import * as React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-[2rem] border border-transparent bg-white shadow-soft', className)} {...props} />
}
