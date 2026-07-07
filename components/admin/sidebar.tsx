"use client"

import Link from 'next/link'
import { Home, Grid, Bed, Calendar, CreditCard, Users, Star, Tag, BarChart, Settings } from 'lucide-react'

const items = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Rooms', href: '/admin/rooms', icon: Bed },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Payments', href: '/admin/payments', icon: CreditCard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Offers', href: '/admin/offers', icon: Tag },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { label: 'Settings', href: '/admin/settings', icon: Settings }
]

export function AdminSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 rounded-r-2xl bg-white p-6 shadow-md lg:block">
      <div className="mb-8">
        <h3 className="text-lg font-semibold">Admin</h3>
        <p className="mt-1 text-sm text-slate-600">Vanprastha Resorts</p>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <Link key={it.href} href={it.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-background hover:text-slate-900">
              <Icon className="h-4 w-4" />
              <span>{it.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
