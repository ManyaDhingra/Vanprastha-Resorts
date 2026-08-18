"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Bed, Calendar, CreditCard, Users, LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { cn } from '@/lib/utils'

const items = [
  { label: 'Dashboard', href: '/admin', icon: Home },
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
                : 'border-slate-200 bg-white text-slate-700'
            )}
          >
            {it.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => void logout()}
          className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
        >
          Log out
        </button>
      </nav>

      {/* Desktop: sidebar */}
      <aside className="hidden w-72 shrink-0 self-start rounded-2xl bg-white p-6 shadow-md lg:block">
        <div className="mb-8">
          <h3 className="text-lg font-semibold">Admin</h3>
          <p className="mt-1 text-sm text-slate-600">Vanprastha Resorts</p>
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
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-background hover:text-slate-900',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-slate-700'
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
          className="mt-8 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-background"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </aside>
    </>
  )
}