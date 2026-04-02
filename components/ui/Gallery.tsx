'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { GalleryImage, Lang } from '@/lib/types'
import { getField } from '@/lib/i18n'

interface GalleryProps {
  images: GalleryImage[]
  projectTitle: string
  lang: Lang
}

function GalleryItem({
  image,
  index,
  projectTitle,
  lang,
}: {
  image: GalleryImage
  index: number
  projectTitle: string
  lang: Lang
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const caption = image.caption_en
    ? getField(image, 'caption', lang)
    : `${projectTitle} — ${index + 1}`

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <Image
        src={image.url}
        alt={caption}
        width={900}
        height={600}
        className="w-full h-auto"
        sizes="(max-width: 768px) 100vw, 800px"
      />
    </motion.div>
  )
}

export default function Gallery({ images, projectTitle, lang }: GalleryProps) {
  if (!images || images.length === 0) return null

  return (
    <div className="mt-16">
      <div className="flex flex-col gap-4">
        {images.map((image, i) => {
          const isFull = i % 3 === 0

          if (isFull) {
            return (
              <GalleryItem
                key={i}
                image={image}
                index={i}
                projectTitle={projectTitle}
                lang={lang}
              />
            )
          }

          if (i % 3 === 1) {
            const nextImage = images[i + 1]
            return (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GalleryItem image={image} index={i} projectTitle={projectTitle} lang={lang} />
                {nextImage && (
                  <GalleryItem image={nextImage} index={i + 1} projectTitle={projectTitle} lang={lang} />
                )}
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
