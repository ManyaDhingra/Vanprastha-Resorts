import type { Metadata } from 'next'
import * as React from 'react'
import LoginForm from './login-form'

// Dynamic so useSearchParams renders on the server: the form ships in the
// HTML response instead of appearing only after client hydration.
export const dynamic = 'force-dynamic'

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
