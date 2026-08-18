"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'
import * as React from 'react'

interface Props {
  images: string[]
  /** Names the subject so screen readers get real descriptions, not indexes. */
  alt?: string
}

export function DetailGallery({ images, alt = 'Room photo' }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {images.map((src, i) => (
        <motion.div key={i} whileHover={{ scale: 1.03 }} className="relative h-56 w-full overflow-hidden rounded-2xl">
          <Image src={src} alt={`${alt} — view ${i + 1}`} fill className="object-cover" />
        </motion.div>
      ))}
    </div>
  )
}
