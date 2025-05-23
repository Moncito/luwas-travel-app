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
    <section className="max-w-6xl mx-auto px-6 pb-24 space-y-12">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col sm:flex-row items-start gap-6 transition-all duration-300 border border-gray-200">
        {data.image && (
          <div className="relative w-full sm:w-52 h-36 sm:h-44 rounded-lg overflow-hidden shadow-sm">
            <Image
              src={data.image}
              alt="Yelp Business"
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Reviews from Yelp that might help you
          </h2>
          <p className="text-gray-700 text-sm mb-3 leading-relaxed">
            {data.summary || 'No summary available.'}
          </p>

          <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
            <Star size={16} className="text-yellow-500 fill-yellow-400" />
            <span>{data.rating?.toFixed(1)} on Yelp</span>
          </div>

          <div className="mt-4">
            <button
              onClick={() => window.open(data.url, '_blank')}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm"
            >
              View full Yelp page
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      {data.reviews?.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.reviews.slice(0, 3).map((review, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                {review.user.image_url ? (
                  <Image
                    src={review.user.image_url}
                    alt={review.user.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full" />
                )}
                <div>
                  <p className="font-medium text-gray-800">{review.user.name}</p>
                  <div className="flex items-center gap-1 text-sm text-yellow-600">
                    <Star size={14} className="fill-yellow-400" />
                    {review.rating.toFixed(1)}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                “{review.text}”
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
