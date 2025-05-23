'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Home, MapPin } from 'lucide-react'
import SubmitReviewForm from '@/components/(map-reviews)/SubmitReviewForm'
import { motion } from 'framer-motion'

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const destinationId = searchParams.get('destinationId')

  if (!destinationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <p className="text-gray-500">Missing destination ID. Please try booking again.</p>
      </div>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center px-6 py-20 text-center space-y-12"
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md p-10 max-w-xl w-full space-y-4">
        <h1 className="text-3xl font-bold text-gray-800">Booking Confirmed</h1>
        <p className="text-gray-600">
          Thank you for booking with <span className="font-semibold text-blue-600">Luwas</span>. 
          We can’t wait for you to start your adventure.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm bg-white border border-gray-300 px-5 py-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition"
        >
          <Home size={18} /> Go Back to Home
        </Link>

        <Link
          href="/history" // ✅ Replaced destination detail view
          className="inline-flex items-center gap-2 text-sm bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition"
        >
          <MapPin size={18} /> View My Trips
        </Link>
      </div>

      {/* Review Form */}
      <div className="w-full max-w-xl">
        <SubmitReviewForm destinationId={destinationId} />
      </div>
    </motion.main>
  )
}
