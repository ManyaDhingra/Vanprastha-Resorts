import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'

const importantLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund Policy', href: '/refund' },
  { label: 'Reservation & Cancellation', href: '/reservation' },
]

const usefulLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/#about' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Activities', href: '/activities' },
  { label: 'Blog', href: '/#blog' },
  { label: 'Gallery', href: '/#gallery' },
  { label: 'Contact Us', href: '/#contact' },
  { label: 'Book Online', href: '/book' },
]

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border/75 bg-surface/90 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + Description */}
          <div className="flex flex-col gap-4">
            <Link href="/" aria-label="Vanprastha Resorts" className="relative block h-10 w-[38px] md:h-11 md:w-[42px]">
              <Image
                src="/images/logo-vanprastha.svg"
                alt=""
                width={512}
                height={487}
                priority
                className="absolute left-0 top-0 max-w-none origin-top-left scale-[0.0781] md:scale-[0.0859]"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-text-muted">
              Vanaprastha is a composite word with the roots &apos;vana&apos; meaning &quot;forest, distant land&quot;, and &apos;prastha&apos; meaning &quot;going to, abiding in, journey to&quot;. The composite word literally means &quot;retiring to forest&quot;.
            </p>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text">Important Links</h3>
            <ul className="flex flex-col gap-2">
              {importantLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-text-muted transition-colors hover:text-text">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text">Useful Links</h3>
            <ul className="flex flex-col gap-2">
              {usefulLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-text-muted transition-colors hover:text-text">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text">Contact Us</h3>
            <ul className="flex flex-col gap-3 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-accent" />
                <span>Near Mahavtar Babaji&apos;s Cave,<br />
                Village-Rathkal, P.O. &ndash; Dunagiri,<br />
                Dwarahat, Distt.: Almora, Uttarakhand-<br />
                263653</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-accent" />
                <a href="tel:+919650102777" className="transition-colors hover:text-text">+91 9650102777, 9458968627</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-accent" />
                <a href="mailto:vanprastharesorts@gmail.com" className="transition-colors hover:text-text">vanprastharesorts@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-border/50 pt-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Vanprastha Resorts. Crafted for premium mountain hospitality in Uttarakhand.</p>
          <Link href="/docs" className="text-primary underline-offset-4 hover:underline">
            System map
          </Link>
        </div>
      </div>
    </footer>
  )
}
