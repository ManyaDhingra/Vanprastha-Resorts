import type { Metadata } from 'next'
import * as React from 'react'
import RegisterForm from './register-form'

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
