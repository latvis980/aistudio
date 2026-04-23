'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CoverImageProps {
  src: string
  alt: string
}

export default function CoverImage({ src, alt }: CoverImageProps) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null)

  return (
    <div className={isPortrait === true ? 'max-w-[66.667%]' : ''}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={500}
        className="w-full h-auto object-cover"
        sizes="(max-width: 768px) 100vw, 700px"
        onLoad={(e) => {
          const img = e.currentTarget
          setIsPortrait(img.naturalHeight > img.naturalWidth)
        }}
      />
    </div>
  )
}
