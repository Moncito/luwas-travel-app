'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SubmitReviewForm({ destinationId }: { destinationId: string }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [hovered, setHovered] = useState<number>(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !rating || !comment) {
      toast.error('Please complete all fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        body: JSON.stringify({ name, rating, comment, destinationId }),
      })

      if (!res.ok) throw new Error('Submission failed')

      toast.success('Thank you for your feedback!')
      setName('')
      setRating(0)
      setComment('')
    } catch (err) {
      toast.error('Something went wrong.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5"
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Leave a Review</h3>
        <p className="text-sm text-gray-500">Share your experience to help other travelers.</p>
      </div>

      {/* Name */}
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      {/* Star Rating */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
            className={`w-7 h-7 cursor-pointer transition ${
              (hovered || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review here..."
        rows={4}
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </motion.form>
  )
}
