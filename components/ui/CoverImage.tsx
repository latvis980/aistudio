'use client'

// components/ui/CoverImage.tsx

import Image from 'next/image'

interface CoverImageProps {
  src: string
  alt: string
  aspectRatio?: string
}

export default function CoverImage({ src, alt, aspectRatio = '3/2' }: CoverImageProps) {
  return (
    <div style={{ aspectRatio }} className="relative w-full max-w-[700px] overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 700px"
        className="object-cover"
      />
    </div>
  )
}