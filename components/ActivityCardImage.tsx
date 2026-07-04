'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'

interface Props {
  src?: string
  alt: string
  title: string
}

export default function ActivityCardImage({ src, alt, title }: Props) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fallbackSrc = '/images/default-avatar.jpg'
  const imageSrc = !imageError && src ? src : fallbackSrc

  return (
    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse z-10" />
      )}
      
      <Image
        src={imageSrc}
        alt={alt || title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setImageError(true)
          setIsLoading(false)
        }}
        priority={false}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent pointer-events-none" />

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-600 z-20">
          <AlertCircle className="h-8 w-8 mb-2" />
          <span className="text-xs text-center px-2">Image unavailable</span>
        </div>
      )}
    </div>
  )
}
