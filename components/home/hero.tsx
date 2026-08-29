"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Layer stack: image (z-0) -> gradient (z-10) -> content (z-20).
          Nothing here depends on JS hydration to become visible: the image
          renders unconditionally and the copy uses a pure-CSS entrance. */}
      <div className="relative h-[75vh] min-h-[520px] w-full overflow-hidden sm:h-[85vh] lg:h-[95vh] xl:h-[100vh]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-mountains.webp"
            alt="Vanprastha Resorts mountain view"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(rgba(255,255,255,0.12), rgba(20,30,50,0.18))' }}
        />

        <div className="hero-fade-up absolute inset-0 z-20 flex items-center justify-center px-6 pointer-events-none">
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

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6 transform -translate-y-8 pointer-events-auto">
              <Button asChild className="shadow-soft h-12">
                <Link href="/book">Reserve a stay</Link>
              </Button>
              <Button variant="outline" asChild className="h-12">
                <Link href="/rooms">Explore retreats</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
