"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Dining', href: '/dining' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Offers', href: '/offers' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' }
]

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300 ease-in-out',
        'backdrop-blur-md',
        scrolled
          ? 'bg-white/95 border-b border-slate-200/70 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-24 transition-opacity duration-300', scrolled ? 'opacity-0' : 'opacity-100')}>
        <div className="h-full bg-gradient-to-b from-black/30 to-transparent" />
      </div>

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="Vanprastha Resorts">
            <Image src="/images/logo-vanprastha.svg" alt="Vanprastha Resorts" width={160} height={48} priority />
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors duration-300',
                scrolled ? 'text-slate-900 hover:text-slate-950' : 'text-white/95 hover:text-white',
                pathname === item.href ? 'border-b-2 border-[#F97316] pb-1' : ''
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <Button asChild>
              <a href="/book">Book Now</a>
            </Button>
          </div>

          <button
            className={cn('md:hidden inline-flex items-center justify-center rounded-lg p-2 transition', scrolled ? 'text-slate-700' : 'text-white')}
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
              className="fixed inset-y-0 right-0 z-50 w-[84%] max-w-sm bg-white/95 p-6 shadow-lg backdrop-blur-md"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between">
                <Link href="/" onClick={() => setOpen(false)}>
                  <Image src="/images/logo-vanprastha.svg" alt="Vanprastha Resorts" width={140} height={40} />
                </Link>
                <button aria-label="Close menu" onClick={() => setOpen(false)} className="rounded p-2">
                  <X size={20} />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-base font-medium text-slate-800">
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-8">
                <Button asChild className="w-full">
                  <a href="/book">Book Now</a>
                </Button>
              </div>
            </motion.div>

            <motion.button
              className="fixed inset-0 z-40 bg-black/30"
              aria-hidden
              onClick={() => setOpen(false)}
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
