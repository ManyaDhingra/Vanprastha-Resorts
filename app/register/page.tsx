import type { Metadata } from 'next'
import * as React from 'react'
import RegisterForm from './register-form'

// Dynamic so useSearchParams renders on the server: the form ships in the
// HTML response instead of appearing only after client hydration.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Create an account — Vanprastha Resorts',
  description: 'Create your Vanprastha Resorts account to book and manage mountain stays.',
}

export default function RegisterPage() {
  return (
    <React.Suspense fallback={null}>
      <RegisterForm />
    </React.Suspense>
  )
}
