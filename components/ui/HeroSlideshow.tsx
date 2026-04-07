'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { GalleryImage } from '@/lib/types'

interface HeroSlideshowProps {
  images: GalleryImage[]
  title: string
}

export default function HeroSlideshow({ images, title }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const advance = useCallback(() => {
    setCurrent((i) => (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1 || paused) return
    const id = setInterval(advance, 5000)
    return () => clearInterval(id)
  }, [images.length, paused, advance])

  if (images.length === 0) return null

  if (images.length === 1) {
    return (
      <Image
        src={images[0].url}
        alt={title}
        width={1200}
        height={700}
        className="w-full h-auto"
        sizes="(max-width: 1024px) 100vw, 900px"
        priority
      />
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src={images[current].url}
              alt={`${title} — ${current + 1}`}
              width={1200}
              height={700}
              className="w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 900px"
              priority={current === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`
              w-2 h-2 rounded-full transition-colors
              ${i === current ? 'bg-ink' : 'bg-ink/25 hover:bg-ink/50'}
            `}
          />
        ))}
      </div>
    </div>
  )
}
