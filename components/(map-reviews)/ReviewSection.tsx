'use client'

import ReviewList from './ReviewList'
import ReviewSummary from './ReviewSummary'
import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

export default function ReviewSection({ destinationId }: { destinationId: string }) {
  const [reviewCount, setReviewCount] = useState(0)
  const [average, setAverage] = useState(0)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/reviews/summary?destinationId=${destinationId}`)
        const data = await res.json()
        setReviewCount(data.count || 0)
        setAverage(data.average || 0)
      } catch (err) {
        console.error('Error fetching review stats', err)
      }
    }

    fetchStats()
  }, [destinationId])

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
      {/* Summary + Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🧠 AI Review Summary</h2>
          <ReviewSummary destinationId={destinationId} />
        </div>

        {/* Average Rating */}
        {reviewCount > 0 && (
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              ⭐ Average Rating
            </p>
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-500 fill-yellow-500" />
              <p className="text-2xl font-bold">{average.toFixed(1)} / 5</p>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Based on {reviewCount} traveler {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                destinationId
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-blue-600 underline"
            >
              See more reviews on Google Maps
            </a>
          </div>
        )}
      </div>

      {/* Traveler Reviews */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">💬 Traveler Reviews</h2>
        <ReviewList destinationId={destinationId} />
      </div>
    </section>
  )
}
