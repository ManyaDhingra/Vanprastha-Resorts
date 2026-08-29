"use client"

import * as React from 'react'
import { apiFetch, clearStoredSession, getStoredToken, storeSession } from '@/lib/utils'

export interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
}

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)
  const restoreRef = React.useRef<AbortController | null>(null)

  // Restore the session from storage, then validate it against the server.
  // A stored but expired/forged token is rejected and cleared.
  // The round-trip is time-bounded: a hung request (dead socket, stalled DB
  // connection) must never leave `loading` stuck and strand gated pages.
  React.useEffect(() => {
    let mounted = true
    // Same storage key the API layer uses (single source — no third literal).
    const t = getStoredToken()
    if (!t) {
      setLoading(false)
      return
    }
    setToken(t)

    const controller = new AbortController()
    restoreRef.current = controller

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('restore-timeout')), 8000)
    })

    Promise.race([apiFetch<{ user: User }>('/api/auth/me', { signal: controller.signal }), timeout])
      .then((data) => {
        if (!mounted || controller.signal.aborted) return
        setUser(data.user)
        storeSession(t, data.user)
      })
      .catch((err: unknown) => {
        if (!mounted || controller.signal.aborted) return
        setUser(null)
        setToken(null)
        // A timed-out check says nothing about token validity — keep it so
        // the next navigation can retry. Real failures clear the session.
        if (!(err instanceof Error && (err.message === 'restore-timeout' || err.name === 'AbortError'))) {
          clearStoredSession()
        }
      })
      .finally(() => {
        if (mounted && !controller.signal.aborted) setLoading(false)
      })

    return () => {
      mounted = false
      controller.abort()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  async function applyAuth(data: { token: string; user: User }) {
    setUser(data.user)
    setToken(data.token)
    storeSession(data.token, data.user)
    return data.user
  }

  async function login(email: string, password: string) {
    restoreRef.current?.abort()
    setLoading(false)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error || 'Invalid credentials')
    }
    return applyAuth(await res.json())
  }

  async function register(name: string, email: string, password: string) {
    restoreRef.current?.abort()
    setLoading(false)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error || 'Registration failed')
    }
    await applyAuth(await res.json())
  }

  const loginCb = React.useCallback(login, [])
  const registerCb = React.useCallback(register, [])

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // cookie may be cleared even if the fetch fails; clear locally anyway
    }
    setUser(null)
    setToken(null)
    clearStoredSession()
  }
  const logoutCb = React.useCallback(logout, [])

  const value = React.useMemo(
    () => ({ user, token, loading, login: loginCb, register: registerCb, logout: logoutCb }),
    [user, token, loading, loginCb, registerCb, logoutCb]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}