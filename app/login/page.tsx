import type { Metadata } from 'next'
import * as React from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import LoginForm from './login-form'

export const metadata: Metadata = {
  title: 'Login — Vanprastha Resorts',
  description: 'Log in to manage your stays at Vanprastha Resorts.',
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  )
}
