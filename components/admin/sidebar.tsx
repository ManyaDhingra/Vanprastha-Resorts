"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bed, Building2, Calendar, CreditCard, Users, LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Blocks', href: '/admin/blocks', icon: Building2 },
  { label: 'Rooms', href: '/admin/rooms', icon: Bed },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Users', href: '/admin/users', icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <>
      {/* Mobile: horizontal nav */}
      <nav className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'shrink-0 rounded-full border px-4 py-2 text-sm',
              pathname === it.href
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-text-muted'
            )}
          >
            {it.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => void logout()}
          className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-muted"
        >
          Log out
        </button>
      </nav>

      {/* Desktop: sidebar */}
      <aside className="hidden w-72 shrink-0 self-start rounded-2xl bg-surface p-6 shadow-md lg:block">
        <div className="mb-8">
          <h3 className="text-lg font-semibold">Admin</h3>
          <p className="mt-1 text-sm text-text-muted">Vanprastha Resorts</p>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((it) => {
            const Icon = it.icon
            const active = pathname === it.href
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-secondary hover:text-text',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-text-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{it.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => void logout()}
          className="mt-8 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </aside>
    </>
  )
}
