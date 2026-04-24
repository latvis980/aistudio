'use client'

// components/ui/CoverImage.tsx

import { useState } from 'react'
import Image from 'next/image'

interface CoverImageProps {
  src: string
  alt: string
}

export default function CoverImage({ src, alt }: CoverImageProps) {
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
    />
  )
}
