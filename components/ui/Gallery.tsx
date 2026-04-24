'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import { GalleryImage, Lang } from '@/lib/types'
import { getField } from '@/lib/i18n'

interface GalleryProps {
  images: GalleryImage[]
  projectTitle: string
  lang: Lang
}

function GalleryThumb({
  image,
  index,
  projectTitle,
  lang,
  onClick,
}: {
  image: GalleryImage
  index: number
  projectTitle: string
  lang: Lang
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const caption = image.caption_en
    ? getField(image, 'caption', lang)
    : `${projectTitle} — ${index + 1}`

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.04 }}
      className="cursor-pointer overflow-hidden aspect-[4/3] bg-gray-100"
      onClick={onClick}
    >
      <Image
        src={image.url}
        alt={caption}
        width={400}
        height={300}
        className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.04]"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
    </motion.div>
  )
}

const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
    scale: 0.98,
  }),
}

const slideTransition = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
}

function Lightbox({
  images,
  startIndex,
  projectTitle,
  lang,
  onClose,
}: {
  images: GalleryImage[]
  startIndex: number
  projectTitle: string
  lang: Lang
  onClose: () => void
}) {
  const [current, setCurrent] = useState(startIndex)
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null)
  const dirRef = useRef<number>(0)
  const touchStartX = useRef<number>(0)

  const prev = useCallback(() => {
    dirRef.current = -1
    setCurrent((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    dirRef.current = 1
    setCurrent((i) => (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    const saved = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = saved }
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, prev, next])

  useEffect(() => {
    setIsPortrait(null)
  }, [current])

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

  const caption = images[current].caption_en
    ? getField(images[current], 'caption', lang)
    : `${projectTitle} — ${current + 1}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 backdrop-blur-2xl bg-black/75 flex flex-col"
    >
      {/* Top bar — counter left, close right; sits above image area */}
      <div className="relative z-30 flex-none h-14 px-5 flex items-center justify-between w-full">
        <span className="text-white/60 text-xs tracking-widest uppercase select-none">
          {current + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            className="w-4 h-4 text-white/80"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Image area — click zones are confined here, never reaching the top bar */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image with direction-aware slide */}
        <AnimatePresence mode="wait" custom={dirRef.current}>
          <motion.div
            key={current}
            custom={dirRef.current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="relative flex items-center justify-center w-full h-full px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[current].url}
              alt={caption}
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
              priority
            />

            {/* Click zones inside image area */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  aria-label="Previous image"
                  className="absolute inset-y-0 left-0 w-[40%] cursor-w-resize z-10"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); next() }}
                  aria-label="Next image"
                  className="absolute inset-y-0 right-0 w-[40%] cursor-e-resize z-10"
                />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 flex gap-2 select-none">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  dirRef.current = i > current ? 1 : -1
                  setCurrent(i)
                }}
                aria-label={`Go to image ${i + 1}`}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === current ? 'bg-white/80' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Caption */}
        {caption && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-8 text-white/50 text-xs tracking-wide select-none whitespace-nowrap">
            {caption}
          </div>
        )}

        {/* Prev arrow — circular, left */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white/80"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}

        {/* Next arrow — circular, right */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white/80"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function Gallery({ images, projectTitle, lang }: GalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  if (!images || images.length === 0) return null

  const openLightbox = (i: number) => {
    setLightboxIndex(i)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="mt-16 max-w-[66.667%]">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {images.map((image, i) => (
            <GalleryThumb
              key={i}
              image={image}
              index={i}
              projectTitle={projectTitle}
              lang={lang}
              onClick={() => openLightbox(i)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={images}
            startIndex={lightboxIndex}
            projectTitle={projectTitle}
            lang={lang}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
