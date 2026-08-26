"use client"

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        className="relative h-[75vh] min-h-[520px] w-full overflow-hidden sm:h-[85vh] lg:h-[95vh] xl:h-[100vh]"
      >
        <Image
          src="/images/hero-mountains.webp"
          alt="Vanprastha Resorts mountain view"
          fill
          className="object-cover object-center"
          priority
        />

        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(rgba(255,255,255,0.12), rgba(20,30,50,0.18))' }}
        />

        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="mx-auto flex w-full max-w-[800px] flex-col items-center text-center text-white">
            <p className="mb-8 inline-flex rounded-full border border-[#A87A3B]/20 bg-[#F5F0E8]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#A87A3B]">
              Himalayan luxury sanctuary
            </p>
            <h1 className="font-heading text-4xl font-normal leading-[1.15] sm:text-5xl xl:text-6xl">
              Vanprastha Resorts — a calm mountain refuge in Uttarakhand
            </h1>
            <p className="mt-6 max-w-[640px] text-lg leading-8 text-white/90">
              Timeless pavilions, restorative rituals and generous hospitality set within tranquil river valleys.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 transform -translate-y-8">
              <Button asChild className="shadow-soft h-12">
                <Link href="/book">Reserve a stay</Link>
              </Button>
              <Button variant="outline" asChild className="h-12">
                <Link href="/rooms">Explore retreats</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
