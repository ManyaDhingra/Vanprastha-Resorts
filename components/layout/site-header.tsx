"use client"

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'
import { cn } from '@/lib/utils'

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Activities', href: '/activities' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Book Now', href: '/book' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // The transparent/white variant is only legible over the homepage hero.
  // Every other route renders on an ivory background, so force the solid
  // surface style there immediately instead of waiting for scroll.
  const solid = scrolled || pathname !== '/'

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Esc closes the mobile drawer.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Close the drawer on route change.
  useEffect(() => close(), [pathname, close])

  // While the session restore is in flight there is no user yet, so the
  // logged-out controls stay visible (a returning logged-in visitor sees a
  // brief flash of them before their chip replaces it) — the auth navigation
  // never blanks out, even if /api/auth/me is slow.
  const authAction = user ? (
    <div className="flex items-center gap-3">
      <Link
        href={user.role === 'ADMIN' ? '/admin' : '/profile'}
        className="hidden items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-sm font-medium text-text md:flex"
      >
        <User size={15} />
        {user.name.split(' ')[0]}
      </Link>
      <button
        type="button"
        onClick={() => void logout()}
        aria-label="Log out"
        className={cn(
          'rounded-full p-2 transition',
          solid ? 'text-text-muted hover:bg-secondary' : 'text-white/90 hover:bg-surface/10'
        )}
      >
        <LogOut size={18} />
      </button>
    </div>
  ) : (
    <>
      <div className="hidden items-center gap-2 md:flex">
        <Link
          href="/login"
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition',
            solid
              ? 'text-text hover:bg-secondary'
              : 'text-white hover:bg-surface/10'
          )}
        >
          Sign In
        </Link>
        <Button asChild>
          <Link href="/register">Sign up</Link>
        </Button>
      </div>
      {/* Compact direct entry point on small screens: the drawer still has
          both links, but Sign In no longer requires discovering the menu. */}
      {!open && (
        <Link
          href="/login"
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium transition md:hidden',
            solid
              ? 'text-text hover:bg-secondary'
              : 'text-white hover:bg-surface/10'
          )}
        >
          Sign In
        </Link>
      )}
    </>
  )

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300 ease-in-out',
        'backdrop-blur-md',
        solid
          ? 'bg-surface/95 border-b border-border/70 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-24 transition-opacity duration-300', solid ? 'opacity-0' : 'opacity-100')}>
        <div className="h-full bg-gradient-to-b from-black/30 to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {/* SVG has no viewBox (intrinsic 512×487): render at natural size
              inside a small box and scale uniformly so the whole mark stays
              visible with the correct aspect ratio. */}
          <Link href="/" aria-label="Vanprastha Resorts" className="relative block h-10 w-[38px] shrink-0 md:h-11 md:w-[42px]">
            <Image
              src="/images/logo-vanprastha.svg"
              alt=""
              width={512}
              height={487}
              priority
              className="absolute left-0 top-0 max-w-none origin-top-left scale-[0.0781] md:scale-[0.0859]"
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors duration-300',
                solid ? 'text-text hover:text-text' : 'text-white/95 hover:text-white',
                pathname === item.href ? 'border-b-2 border-accent pb-1' : ''
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {authAction}
          <button
            className={cn('md:hidden inline-flex items-center justify-center rounded-lg p-2 transition', solid ? 'text-text' : 'text-white')}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-[84%] max-w-sm bg-surface/95 p-6 shadow-lg backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between">
                <Link href="/" onClick={close} aria-label="Vanprastha Resorts" className="relative block h-9 w-[35px]">
                  <Image
                    src="/images/logo-vanprastha.svg"
                    alt=""
                    width={512}
                    height={487}
                    className="absolute left-0 top-0 max-w-none origin-top-left scale-[0.0703]"
                  />
                </Link>
                <button aria-label="Close menu" onClick={close} className="rounded p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} onClick={close} className="text-base font-medium text-text">
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      href={user.role === 'ADMIN' ? '/admin' : '/profile'}
                      onClick={close}
                      className="text-base font-medium text-text"
                    >
                      {user.role === 'ADMIN' ? 'Admin panel' : 'My bookings'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => { void logout(); close() }}
                      className="text-left text-base font-medium text-text"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={close} className="text-base font-medium text-text">
                      Sign In
                    </Link>
                    <Link href="/register" onClick={close} className="text-base font-medium text-text">
                      Sign up
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-8">
                <Button asChild className="w-full">
                  <Link href="/book" onClick={close}>Book Now</Link>
                </Button>
              </div>
            </motion.div>

            <motion.button
              type="button"
              tabIndex={-1}
              className="fixed inset-0 z-40 cursor-default bg-black/30"
              aria-hidden
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

