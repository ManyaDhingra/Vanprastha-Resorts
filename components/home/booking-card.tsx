"use client"

import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function BookingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mx-auto w-full max-w-[1100px] rounded-[32px] bg-white/95 px-7 py-7 shadow-2xl"
    >
      <form className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <label className="sr-only">Check in</label>
        <input type="date" aria-label="Check in" className="rounded-md border border-slate-200 px-3 py-2" />

        <label className="sr-only">Check out</label>
        <input type="date" aria-label="Check out" className="rounded-md border border-slate-200 px-3 py-2" />

        <label className="sr-only">Guests</label>
        <select aria-label="Guests" className="rounded-md border border-slate-200 px-3 py-2">
          <option>2 guests</option>
          <option>3 guests</option>
          <option>4 guests</option>
        </select>

        <div className="flex items-center">
          <Button className="w-full">Check availability</Button>
        </div>
      </form>
    </motion.div>
  )
}
