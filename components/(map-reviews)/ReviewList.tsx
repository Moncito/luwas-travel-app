'use client'

import { useEffect, useState } from 'react'

interface Review {
  name: string
  comment: string
  rating: number
  createdAt?: string
}

export default function ReviewList({ destinationId }: { destinationId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?destinationId=${destinationId}`)
        const data = await res.json()
        const valid = (data.reviews || []).filter(
          (r: any) => r?.name && r?.comment && r?.rating !== undefined
        )
        setReviews(valid)
      } catch (err) {
        console.error('Failed to fetch reviews:', err)
        setReviews([])
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [destinationId])

  if (loading) {
    return <p className="text-gray-500 text-sm text-center">Loading reviews...</p>
  }

  if (!reviews.length) {
    return <p className="text-gray-500 text-sm text-center">No reviews submitted yet.</p>
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, i) => (
        <div
          key={i}
          className="bg-white/80 rounded-xl p-4 shadow-sm space-y-1"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-gray-800 font-medium">{review.name || 'Anonymous'}</h4>
            <div className="text-yellow-500 text-sm">⭐ {review.rating}</div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
        </div>
      ))}
    </div>
  )
}
