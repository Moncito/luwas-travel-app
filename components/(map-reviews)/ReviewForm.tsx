'use client'

import { useState } from 'react'
import { db } from '@/firebase/client'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'

interface ReviewFormProps {
  destinationId: string
}

export default function ReviewForm({ destinationId }: ReviewFormProps) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !rating || !comment) {
      toast.error('Please fill in all fields.')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        name,
        rating,
        comment,
        destinationId,
        createdAt: serverTimestamp(),
      })
      toast.success('Review submitted successfully!')
      setName('')
      setRating(0)
      setComment('')
    } catch (error) {
      toast.error('Error submitting review.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <h3 className="text-xl font-semibold">✍️ Leave a Review</h3>
      <input
        type="text"
        placeholder="Your Name"
        className="w-full p-2 border border-gray-300 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <select
        className="w-full p-2 border border-gray-300 rounded"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        <option value={0}>Select Rating</option>
        {[1, 2, 3, 4, 5].map((star) => (
          <option key={star} value={star}>
            {star} Star{star > 1 && 's'}
          </option>
        ))}
      </select>
      <textarea
        placeholder="Your comment..."
        className="w-full p-2 border border-gray-300 rounded"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
