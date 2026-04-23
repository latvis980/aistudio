'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, useInView, AnimatePresence } from 'framer-motion'
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

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, prev, next])

  const caption = images[current].caption_en
    ? getField(images[current], 'caption', lang)
    : `${projectTitle} — ${current + 1}`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/92 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-widest uppercase select-none">
        {current + 1} / {images.length}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-5 text-white/60 hover:text-white text-2xl leading-none transition-colors"
      >
        ×
      </button>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center w-full h-full px-16"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={images[current].url}
            alt={caption}
            width={1800}
            height={1200}
            className="max-h-[85vh] max-w-[90vw] w-auto h-auto object-contain"
            sizes="90vw"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-wide select-none whitespace-nowrap">
          {caption}
        </div>
      )}

      {/* Prev arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-3xl leading-none transition-colors px-2 py-4"
        >
          ‹
        </button>
      )}

      {/* Next arrow */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-3xl leading-none transition-colors px-2 py-4"
        >
          ›
        </button>
      )}
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
      <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-2">
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
