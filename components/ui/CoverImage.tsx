'use client'
// components/ui/CoverImage.tsx

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { rememberCoverDims, getCoverDims } from '@/lib/coverDimsCache'

interface CoverImageProps {
  src: string
  alt: string
  /** Shared layout id so the image can morph into the project page hero. */
  layoutId?: string
}

export default function CoverImage({ src, alt, layoutId }: CoverImageProps) {
  // Seed orientation from the sessionStorage cache when available so a
  // return to the feed lays out without flipping. The lazy initializer
  // runs once per mount; SSR sees null, client sees the cached value.
  const [isPortrait, setIsPortrait] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null
    const cached = getCoverDims(src)
    return cached ? cached.h >= cached.w : null
  })

  return (
    <motion.div
      layoutId={layoutId}
      // We size the box around the image; the morph reads this box's bounds.
      className="flex justify-start"
      transition={{ layout: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] } }}
      // Cached orientation can differ from the SSR null on rare direct
      // hard-loads where sessionStorage already has data for this URL.
      suppressHydrationWarning
    >
      <Image
        src={src}
        alt={alt}
        width={0}
        height={0}
        sizes="(max-width: 768px) 100vw, 700px"
        style={
          isPortrait
            ? { height: 'min(700px, 90vw)', width: 'auto', maxWidth: '100%' }
            : { width: '100%', maxWidth: '700px', height: 'auto' }
        }
        onLoad={(e) => {
          const img = e.currentTarget
          rememberCoverDims(src, { w: img.naturalWidth, h: img.naturalHeight })
          setIsPortrait(img.naturalHeight >= img.naturalWidth)
        }}
      />
    </motion.div>
  )
}
