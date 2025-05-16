'use client'

import { useEffect, useState } from 'react'
import { db } from '@/firebase/client'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore'
import ReviewForm from './ReviewForm'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: Timestamp
}

export default function ReviewSection({ destinationId }: { destinationId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(false)

  // Fetch reviews
  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      where('destinationId', '==', destinationId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Review, 'id'>),
      }))
      setReviews(fetched)
    })

    return () => unsubscribe()
  }, [destinationId])

  // Generate AI Summary
  useEffect(() => {
    if (reviews.length === 0) return

    const loadSummary = async () => {
      setLoadingSummary(true)
      try {
        const res = await fetch('/api/review-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments: reviews.map((r) => r.comment) }),
        })
        const data = await res.json()
        setSummary(data.summary || '')
      } catch (err) {
        console.error('AI Summary error:', err)
        setSummary('')
      } finally {
        setLoadingSummary(false)
      }
    }

    loadSummary()
  }, [reviews])

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 space-y-16">
      {/* AI Summary + Review Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 🧠 AI Review Summary */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center md:text-left">
            🧠 AI Review Summary
          </h2>
          {loadingSummary ? (
            <p className="text-gray-500 text-sm">Generating summary...</p>
          ) : summary ? (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-700">{summary}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No reviews yet to summarize.</p>
          )}
        </div>

        {/* ✍️ Review Form */}
        <div className="bg-white rounded-xl p-6 border shadow">
          <ReviewForm destinationId={destinationId} />
        </div>
      </div>

      {/* 💬 Traveler Reviews */}
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">💬 Traveler Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded p-4 shadow-sm text-left">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{review.name}</h4>
                  <span className="text-yellow-500 text-sm">
                    {'⭐'.repeat(review.rating)}{' '}
                    <span className="text-gray-400 ml-1">{review.rating}/5</span>
                  </span>
                </div>
                <p className="text-sm text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to share your experience!</p>
        )}
      </div>
    </section>
  )
}
