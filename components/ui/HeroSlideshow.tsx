'use client'

// components/ui/HeroSlideshow.tsx

import { useState, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { GalleryImage } from '@/lib/types'
import { getCoverDims, rememberCoverDims } from '@/lib/coverDimsCache'

interface HeroSlideshowProps {
  images: GalleryImage[]
  title: string
  /** Shared layout id so the first hero can morph from the feed cover. */
  coverLayoutId?: string
}

// Desktop cap for the longer dimension of the hero frame.
const HERO_MAX_PX = 800

export default function HeroSlideshow({ images, title, coverLayoutId }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0)
  // Seed dims so the frame reserves the correct aspect ratio on first paint
  // and the layoutId morph from the feed cover lands on a stable target.
  // Order: explicit width/height on the image record → sessionStorage cache
  // populated by the feed CoverImage → null (portrait default).
  const [heroDims, setHeroDims] = useState<{ w: number; h: number } | null>(() => {
    const first = images[0]
    if (first?.width && first?.height) return { w: first.width, h: first.height }
    if (typeof window !== 'undefined' && first?.url) {
      return getCoverDims(first.url)
    }
    return null
  })
  const touchStartX = useRef(0)

  if (images.length === 0) return null

  const handleHeroLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const next = { w: img.naturalWidth, h: img.naturalHeight }
    if (images[0]?.url) rememberCoverDims(images[0].url, next)
    if (heroDims && heroDims.w === next.w && heroDims.h === next.h) return
    setHeroDims(next)
  }

  // Frame sizing derived from the hero image's natural aspect ratio so the
  // container reserves the correct slot on first paint (no load-time jump).
  //  - Desktop: cap the longer dimension at HERO_MAX_PX.
  //  - Mobile: fills available container width; height follows via aspect-ratio.
  const frameStyle: React.CSSProperties = (() => {
    if (!heroDims) {
      // Default portrait slot until the hero reports its dimensions.
      return {
        aspectRatio: '3 / 4',
        maxWidth: `${Math.round((3 / 4) * HERO_MAX_PX)}px`,
      }
    }
    const isVertical = heroDims.h >= heroDims.w
    const aspectRatio = `${heroDims.w} / ${heroDims.h}`
    const maxWidth = isVertical
      ? `${Math.round((heroDims.w / heroDims.h) * HERO_MAX_PX)}px`
      : `${HERO_MAX_PX}px`
    return { aspectRatio, maxWidth }
  })()

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length)
  const next = () => setCurrent((i) => (i + 1) % images.length)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) {
      if (delta > 0) next()
      else prev()
    }
  }

  return (
    <div className="relative select-none">
      <motion.div
        layoutId={coverLayoutId}
        className="relative overflow-hidden mr-auto w-full"
        style={frameStyle}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        transition={{ layout: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] } }}
        // The seed dims above can come from sessionStorage (client-only),
        // which can differ from the SSR null in rare hard-load scenarios.
        suppressHydrationWarning
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={current}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Image
              src={images[current].url}
              alt={`${title} — ${current + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-contain"
              priority={current === 0}
              onLoad={current === 0 ? handleHeroLoad : undefined}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
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
          </>
        )}
      </motion.div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? 'bg-ink' : 'bg-ink/25 hover:bg-ink/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
