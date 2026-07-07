import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parsePrice(price: string) {
  if (!price) return 0
  const digits = price.replace(/[^0-9]/g, '')
  return Number(digits) || 0
}
