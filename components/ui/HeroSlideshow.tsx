'use client'

import { useState, useRef } from 'react'
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
  heroOrientation = null,
  heroHeight = null,
  onHeroLoad,
}: {
  src: string
  alt: string
  priority?: boolean
  heroOrientation?: 'vertical' | 'horizontal' | null
  heroHeight?: number | null
  onHeroLoad?: (nw: number, nh: number) => void
}) {
  const [selfOrientation, setSelfOrientation] = useState<'vertical' | 'horizontal' | null>(null)

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const portrait = img.naturalHeight >= img.naturalWidth
    setSelfOrientation(portrait ? 'vertical' : 'horizontal')
    onHeroLoad?.(img.naturalWidth, img.naturalHeight)
  }

  // Sizing rules:
  // - Horizontal hero: all images constrained to heroHeight; vertical images centred within it
  // - Vertical hero (or hero unknown): vertical images at 700 px tall; horizontal images at 700 px wide (centred vertically by container)
  let style: React.CSSProperties

  if (heroOrientation === 'horizontal') {
    if (selfOrientation === 'vertical' && heroHeight) {
      style = { height: `${heroHeight}px`, width: 'auto' }
    } else {
      style = { width: '700px', height: 'auto' }
    }
  } else {
    if (selfOrientation === 'horizontal') {
      style = { width: '700px', height: 'auto' }
    } else {
      style = { height: '700px', width: 'auto' }
    }
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={0}
      height={0}
      sizes="700px"
      style={style}
      onLoad={handleLoad}
      priority={priority}
      draggable={false}
    />
  )
}

export default function HeroSlideshow({ images, title }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0)
  const [heroOrientation, setHeroOrientation] = useState<'vertical' | 'horizontal' | null>(null)
  const [heroHeight, setHeroHeight] = useState<number | null>(null)
  const touchStartX = useRef(0)

  if (images.length === 0) return null

  const handleHeroLoad = (nw: number, nh: number) => {
    const isVertical = nh >= nw
    setHeroOrientation(isVertical ? 'vertical' : 'horizontal')
    setHeroHeight(isVertical ? 700 : Math.round((nh / nw) * 700))
  }

  // Once the hero image has loaded, lock the container to that height so all
  // subsequent slides occupy the same vertical space.
  const containerStyle: React.CSSProperties = heroHeight ? { height: `${heroHeight}px` } : {}

  if (images.length === 1) {
    return (
      <SlideshowImage
        src={images[0].url}
        alt={title}
        priority
        heroOrientation={heroOrientation}
        heroHeight={heroHeight}
        onHeroLoad={handleHeroLoad}
      />
    )
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
      {/* Container height is fixed by the hero image once it loads.
          flex centering ensures non-matching images are padded symmetrically. */}
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={containerStyle}
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
              heroOrientation={heroOrientation}
              heroHeight={heroHeight}
              onHeroLoad={current === 0 ? handleHeroLoad : undefined}
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
