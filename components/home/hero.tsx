"use client"

import Image from 'next/image'
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
          src="/images/hero-mountains.png"
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
            <p className="mb-8 inline-flex rounded-full bg-[#FEE7D6]/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#C65B24]">
              Himalayan luxury sanctuary
            </p>
            <h1 className="font-heading text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
              Vanprastha Resorts — a calm mountain refuge in Uttarakhand
            </h1>
            <p className="mt-6 max-w-[640px] text-lg leading-8 text-white/90">
              Timeless pavilions, restorative rituals and generous hospitality set within tranquil river valleys.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 transform -translate-y-8">
              <Button className="shadow-soft h-12">Reserve a stay</Button>
              <Button variant="outline" asChild className="h-12">
                <a href="#experience">Explore retreats</a>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
