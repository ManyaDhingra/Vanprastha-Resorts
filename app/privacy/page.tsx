import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Vanprastha Resorts',
  description: 'Privacy policy for Vanprastha Resorts reservations and guest services.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-28 pb-16">
      <h1 className="font-heading text-3xl font-normal leading-[1.15] text-text sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-text-muted">Vanprastha Resorts</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-muted">
        <p>
          This Privacy Policy describes how Vanprastha Resorts (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;) collects, uses, and protects your personal information when you visit
          our website, make a reservation, or use our services.
        </p>

        <h2 className="font-heading text-lg font-medium text-text">Information We Collect</h2>
        <p>
          We may collect personal information such as your name, email address, phone number,
          payment details, and travel preferences when you make a reservation or contact us.
        </p>

        <h2 className="font-heading text-lg font-medium text-text">How We Use Your Information</h2>
        <p>
          Your information is used to process reservations, communicate booking confirmations,
          provide guest services, and improve our offerings. We do not sell or share your
          personal information with third parties for marketing purposes.
        </p>

        <h2 className="font-heading text-lg font-medium text-text">Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information.
          Payment transactions are processed through secure, encrypted channels.
        </p>

        <h2 className="font-heading text-lg font-medium text-text">Cookies</h2>
        <p>
          Our website may use cookies to enhance your browsing experience. You can control
          cookie settings through your browser preferences.
        </p>

        <h2 className="font-heading text-lg font-medium text-text">Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:reservations@vanprastha.com" className="text-primary underline">
            reservations@vanprastha.com
          </a>
          .
        </p>
      </div>

      <div className="mt-10">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          &larr; Back to home
        </Link>
      </div>
    </main>
  )
}
