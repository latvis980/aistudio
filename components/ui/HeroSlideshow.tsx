'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { GalleryImage } from '@/lib/types'

interface HeroSlideshowProps {
  images: GalleryImage[]
  title: string
}

function SlideshowImage({
  src,
  alt,
  priority,
}: {
  src: string
  alt: string
  priority?: boolean
}) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null)

  return (
    <Image
      src={src}
      alt={alt}
      width={0}
      height={0}
      sizes="700px"
      style={
        isPortrait
          ? { height: '700px', width: 'auto' }
          : { width: '700px', height: 'auto' }
      }
      onLoad={(e) => {
        const img = e.currentTarget
        setIsPortrait(img.naturalHeight >= img.naturalWidth)
      }}
      priority={priority}
      draggable={false}
    />
  )
}

export default function HeroSlideshow({ images, title }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)

  if (images.length === 0) return null

  if (images.length === 1) {
    return <SlideshowImage src={images[0].url} alt={title} priority />
  }

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length)
  const next = () => setCurrent((i) => (i + 1) % images.length)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) {
      if (delta > 0) { next() } else { prev() }
    }
  }

  return (
    <div className="relative select-none">
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SlideshowImage
              src={images[current].url}
              alt={`${title} — ${current + 1}`}
              priority={current === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Click zones */}
        <button
          onClick={prev}
          aria-label="Previous image"
          className="absolute inset-y-0 left-0 w-[40%] cursor-w-resize z-10"
        />
        <button
          onClick={next}
          aria-label="Next image"
          className="absolute inset-y-0 right-0 w-[40%] cursor-e-resize z-10"
        />
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
