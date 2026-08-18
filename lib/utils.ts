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

/** Session cookie name (page-level auth for middleware; same JWT as the
 * Bearer token used by API routes). Single source so middleware and server
 * code can never drift. */
export const TOKEN_COOKIE = 'vp_token'

/* ---------- display helpers ---------- */

export function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Nights between two YYYY-MM-DD dates (identical to the server's
 * calculateNights): ceiling, minimum 1.
 */
export function calculateNights(checkIn: string, checkOut: string) {
  const inMs = new Date(`${checkIn}T00:00:00.000Z`).getTime()
  const outMs = new Date(`${checkOut}T00:00:00.000Z`).getTime()
  if (isNaN(inMs) || isNaN(outMs) || outMs <= inMs) return 0
  return Math.max(1, Math.ceil((outMs - inMs) / (1000 * 60 * 60 * 24)))
}

/* ---------- client session helpers (browser-safe: guarded) ---------- */

const TOKEN_KEY = 'vp_token'
const USER_KEY = 'vp_user'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function storeSession(token: string, user: unknown) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

/**
 * fetch wrapper that attaches the Bearer token and handles session expiry.
 * On 401 the local session is cleared and the user is sent to /login.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(url, { ...options, headers })

  if (res.status === 401) {
    clearStoredSession()
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
    throw new Error('Session expired. Please log in again.')
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // non-JSON error body; keep the default message
    }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}