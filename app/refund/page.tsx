import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Refund Policy — Vanprastha Resorts',
  description: 'Refund policy for Vanprastha Resorts reservations and cancellations.',
}

export default function RefundPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-28 pb-16">
      <h1 className="font-heading text-3xl font-normal leading-[1.15] text-text sm:text-4xl">
        Refund Policy
      </h1>
      <p className="mt-2 text-sm text-text-muted">Vanprastha Resorts</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-muted">
        <ul className="list-disc space-y-4 pl-5">
          <li>
            On cancellation of refundable booking the refund processing will take time between
            two (2) to four (4) weeks to show refund back on your credit card statement. Reasons
            for the specified processing time are based on the billing cycle of your credit card
            company and processing time of the bank. The refund depends on numerous factors such
            as the resort&apos;s cancellation policy, time of cancellation and processing fees etc.
            For more details refer to the cancellation policy mentioned above.
          </li>
          <li>
            In case the reservation is not confirmed, we will not charge you anything on your
            credit card and release the whole amount if any that was held on it immediately. Now
            after we do this, it will still take two (2) to four (4) weeks for the bank to
            process the refund and to show the refunded amount on your credit card.
          </li>
        </ul>
      </div>

      <div className="mt-10">
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          &larr; Back to home
        </Link>
      </div>
    </main>
  )
}
