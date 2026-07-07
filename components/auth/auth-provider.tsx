"use client"

import * as React from 'react'

type User = { id: string; name: string; email: string }

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const t = localStorage.getItem('vp_token')
    const u = localStorage.getItem('vp_user')
    if (t && u) {
      setToken(t)
      try { setUser(JSON.parse(u)) } catch { setUser(null) }
    }
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (!res.ok) throw new Error('Invalid credentials')
    const data = await res.json()
    setUser({ id: data.id, name: data.name, email: data.email })
    setToken(data.token)
    localStorage.setItem('vp_token', data.token)
    localStorage.setItem('vp_user', JSON.stringify({ id: data.id, name: data.name, email: data.email }))
  }

  async function register(name: string, email: string, password: string) {
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err?.error || 'Registration failed')
    }
    const data = await res.json()
    setUser({ id: data.id, name: data.name, email: data.email })
    setToken(data.token)
    localStorage.setItem('vp_token', data.token)
    localStorage.setItem('vp_user', JSON.stringify({ id: data.id, name: data.name, email: data.email }))
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('vp_token')
    localStorage.removeItem('vp_user')
  }

  const value = React.useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
