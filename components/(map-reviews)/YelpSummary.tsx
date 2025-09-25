'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import Image from 'next/image'

interface Props {
  name: string
  location: string
}

interface YelpReview {
  text: string
  rating: number
  user: {
    name: string
    image_url: string
  }
}

export default function YelpSummary({ name, location }: Props) {
  const [data, setData] = useState<{
    summary: string
    rating: number
    url: string
    image: string
    reviews: YelpReview[]
  } | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchYelp = async () => {
      try {
        const res = await fetch(`/api/yelp/summary?name=${encodeURIComponent(name)}&location=${encodeURIComponent(location)}`)
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error('Yelp fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchYelp()
  }, [name, location])

  if (loading || !data) return null
  if (!data.summary && !data.rating) return null

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      {/* Image */}
      {data.image ? (
        <div className="relative w-full sm:w-52 h-36 sm:h-44 rounded-lg overflow-hidden shadow-sm">
          <Image
            src={data.image}
            alt="Yelp Business"
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ) : (
        <div className="w-full sm:w-52 h-36 sm:h-44 bg-gray-100 flex items-center justify-center text-gray-500 text-sm rounded-lg">
          No image
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Reviews from Yelp
        </h3>
        <p className="text-gray-700 text-sm mb-2 leading-relaxed">
          {data.summary || 'No summary available.'}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
          <Star size={16} className="text-yellow-500 fill-yellow-400" />
          <span>{data.rating?.toFixed(1)} on Yelp</span>
        </div>

        {data.url && (
          <div className="mt-3">
            <button
              onClick={() => window.open(data.url, '_blank')}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm"
            >
              View on Yelp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
