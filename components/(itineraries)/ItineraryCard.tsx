'use client'

import Image from 'next/image'
import Link from 'next/link'

interface ItineraryProps {
  slug: string
  title: string
  imageUrl: string
  duration?: string
  highlights: string[]
  price?: number
}

export default function ItineraryCard({
  slug,
  title,
  imageUrl,
  duration = 'Multi-day Trip',
  highlights,
  price = 0
}: ItineraryProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-5 space-y-2">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-gray-600 italic">{duration}</p>
        <p className="text-sm font-semibold">₱{price.toLocaleString()} per person</p>

        <ul className="text-xs text-gray-600 list-disc list-inside">
          {highlights.slice(0, 3).map((h, i) => (
            <li key={i} className="truncate">{h}</li>
          ))}
        </ul>

        <Link
          href={`/itineraries/${slug}`}
          className="inline-block text-sm  hover:underline font-medium mt-3"
        >
          View Details →
        </Link>
      </div>
    </div>
  )
}
