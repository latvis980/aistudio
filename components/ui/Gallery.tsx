'use client'

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'
import Image from 'next/image'
import { motion, useInView, AnimatePresence, type Variants } from 'framer-motion'
import { GalleryImage, Lang } from '@/lib/types'
import { getField } from '@/lib/i18n'
import { rememberCoverDims, getCoverDims } from '@/lib/coverDimsCache'

interface GalleryProps {
  images: GalleryImage[]
  projectTitle: string
  lang: Lang
  /** Applied to the first image so it can morph from the Works feed cover. */
  coverLayoutId?: string
  /** Rendered between the first image and the rest of the gallery. */
  bodySlot?: ReactNode
}

function GalleryThumb({
  image,
  index,
  projectTitle,
  lang,
  onClick,
  layoutId,
}: {
  image: GalleryImage
  index: number
  projectTitle: string
  lang: Lang
  onClick: () => void
  layoutId?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const [isPortrait, setIsPortrait] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null
    const cached = getCoverDims(image.url)
    return cached ? cached.h >= cached.w : null
  })

  const caption = image.caption_en
    ? getField(image, 'caption', lang)
    : `${projectTitle} — ${index + 1}`

  // The first image participates in a shared-layout morph from the feed.
  // Skip the fade/translate so the morph plays cleanly.
  const useFade = !layoutId

  return (
    <motion.div
      ref={ref}
      layoutId={layoutId}
      initial={useFade ? { opacity: 0, y: 16 } : false}
      animate={useFade ? (isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }) : undefined}
      transition={
        useFade
          ? { duration: 0.4 }
          : { layout: { duration: 0.45, ease: [0.22, 0.61, 0.36, 1] } }
      }
      className="cursor-pointer flex justify-start"
      onClick={onClick}
      suppressHydrationWarning
    >
      <Image
        src={image.url}
        alt={caption}
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
          rememberCoverDims(image.url, { w: img.naturalWidth, h: img.naturalHeight })
          setIsPortrait(img.naturalHeight >= img.naturalWidth)
        }}
      />
    </motion.div>
  )
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

const fadeTransition = { duration: 0.25, ease: 'easeInOut' as const }

function CloseIcon() {
  return (
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
  )
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
  const dirRef = useRef<number>(0)
  const touchStartX = useRef<number>(0)

  const [zoomed, setZoomed] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 })

  const navigate = useCallback(
    (dir: number) => {
      dirRef.current = dir
      setZoomed(false)
      setPan({ x: 0, y: 0 })
      setCurrent((i) => (i + dir + images.length) % images.length)
    },
    [images.length],
  )

  const prev = useCallback(() => navigate(-1), [navigate])
  const next = useCallback(() => navigate(1), [navigate])

  const toggleZoom = useCallback(() => {
    setZoomed((z) => !z)
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    const saved = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = saved }
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomed) { setZoomed(false); setPan({ x: 0, y: 0 }) }
        else { onClose() }
      }
      if (!zoomed && e.key === 'ArrowLeft') prev()
      if (!zoomed && e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, prev, next, zoomed])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomed) return
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (zoomed) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) { if (delta > 0) { next() } else { prev() } }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomed) return
    setDragging(true)
    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, panX: pan.x, panY: pan.y }
    e.preventDefault()
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoomed || !dragging) return
    setPan({
      x: dragStart.current.panX + e.clientX - dragStart.current.mouseX,
      y: dragStart.current.panY + e.clientY - dragStart.current.mouseY,
    })
  }
  const handleMouseUp = () => setDragging(false)

  const caption = images[current].caption_en
    ? getField(images[current], 'caption', lang)
    : `${projectTitle} — ${current + 1}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black flex group/lb"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="relative flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {!zoomed && images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous image" className="absolute inset-y-0 left-0 w-1/2 z-10 cursor-w-resize" />
            <button onClick={next} aria-label="Next image" className="absolute inset-y-0 right-0 w-1/2 z-10 cursor-e-resize" />
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={fadeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={fadeTransition}
            className={`absolute inset-0 z-20 ${zoomed ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ cursor: zoomed ? (dragging ? 'grabbing' : 'grab') : 'default' }}
            onMouseDown={handleMouseDown}
          >
            <div
              className="w-full h-full"
              style={{
                transform: zoomed ? `scale(2) translate(${pan.x / 2}px, ${pan.y / 2}px)` : undefined,
                transition: dragging ? 'none' : 'transform 0.25s ease',
              }}
            >
              <Image
                src={images[current].url}
                alt={caption}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, calc(100vw - 56px)"
                priority
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute top-5 left-5 z-30 text-white/70 text-xs tracking-widest select-none pointer-events-none opacity-100 md:opacity-0 md:group-hover/lb:opacity-100 transition-opacity duration-200">
          {current + 1} / {images.length}
        </div>

        {!zoomed && images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              aria-label="Previous image"
              className="absolute left-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 hidden md:flex items-center justify-center opacity-0 group-hover/lb:opacity-100 transition-opacity duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              aria-label="Next image"
              className="absolute right-5 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 hidden md:flex items-center justify-center opacity-0 group-hover/lb:opacity-100 transition-opacity duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        <button
          onClick={toggleZoom}
          aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
          className="absolute bottom-5 right-5 z-30 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 hidden md:flex items-center justify-center opacity-0 group-hover/lb:opacity-100 transition-opacity duration-200"
        >
          {zoomed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M8 11h6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
            </svg>
          )}
        </button>

        {caption && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 text-white/60 text-xs tracking-wide select-none whitespace-nowrap pointer-events-none opacity-100 md:opacity-0 md:group-hover/lb:opacity-100 transition-opacity duration-200">
            {caption}
          </div>
        )}

        <button onClick={onClose} aria-label="Close" className="md:hidden absolute top-4 right-4 z-40 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
          <CloseIcon />
        </button>
      </div>

      <div className="hidden md:flex flex-none w-14 flex-col items-center pt-5">
        <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <CloseIcon />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function Gallery({
  images,
  projectTitle,
  lang,
  coverLayoutId,
  bodySlot,
}: GalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  if (!images || images.length === 0) return null

  const openLightbox = (i: number) => {
    setLightboxIndex(i)
    setLightboxOpen(true)
  }

  const [first, ...rest] = images

  return (
    <>
      <div className="flex flex-col gap-8">
        <GalleryThumb
          image={first}
          index={0}
          projectTitle={projectTitle}
          lang={lang}
          onClick={() => openLightbox(0)}
          layoutId={coverLayoutId}
        />

        {bodySlot}

        {rest.map((image, i) => (
          <GalleryThumb
            key={i + 1}
            image={image}
            index={i + 1}
            projectTitle={projectTitle}
            lang={lang}
            onClick={() => openLightbox(i + 1)}
          />
        ))}
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
