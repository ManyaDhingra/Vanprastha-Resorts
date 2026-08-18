"use client"

import * as React from 'react'
import { apiFetch, clearStoredSession, storeSession } from '@/lib/utils'

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

  // Restore the session from storage, then validate it against the server.
  // A stored but expired/forged token is rejected and cleared.
  React.useEffect(() => {
    let mounted = true
    const t = localStorage.getItem('vp_token')
    if (!t) {
      setLoading(false)
      return
    }
    setToken(t)

    apiFetch<{ user: User }>('/api/auth/me')
      .then((data) => {
        if (!mounted) return
        setUser(data.user)
        storeSession(t, data.user)
      })
      .catch(() => {
        if (!mounted) return
        setUser(null)
        setToken(null)
        clearStoredSession()
      })
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [])

  async function applyAuth(data: { token: string; user: User }) {
    setUser(data.user)
    setToken(data.token)
    storeSession(data.token, data.user)
    return data.user
  }

  async function login(email: string, password: string) {
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