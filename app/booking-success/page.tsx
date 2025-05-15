'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function BookingSuccessPage() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-white to-blue-100 text-center px-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.div
        initial={{ rotate: -10, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <CheckCircle className="w-20 h-20 text-blue-500 mb-4" />
      </motion.div>

      <motion.h1
        className="text-4xl font-bold text-blue-700 mb-1"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Travel Booked Successfully!
      </motion.h1>

      <motion.p
        className="text-blue-800 font-semibold mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Thank you for booking with <span className="text-blue-900 font-bold">Luwas</span>
      </motion.p>

      <motion.p
        className="text-gray-600 mb-6 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Your trip is locked and loaded. See you in the skies! Check your travel history for details.
      </motion.p>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <img
        src="https://media.giphy.com/media/Btn42lfKKrOzS/giphy.gif"
        alt="Flying Plane"
        className="w-[300px] h-auto rounded-xl shadow-lg border border-blue-200 mb-6"
        />

      </motion.div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Link
          href="/history"
          className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-all shadow-md"
        >
          View My Travel History
        </Link>
      </motion.div>
    </motion.div>
  )
}
