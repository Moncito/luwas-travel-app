'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Lottie from 'react-lottie-player';
import successAnim from '@/../public/lottie/success.json';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

export default function BookingSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // You can pass type & title in query (?type=destination&title=Siargao)
  const bookingType = searchParams.get('type') || 'Booking';
  const bookingTitle = searchParams.get('title') || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center relative"
      >
        {/* Lottie Animation */}
        <div className="w-40 h-40 mx-auto mb-6">
          <Lottie
            loop={false}
            play
            animationData={successAnim}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-blue-900 flex justify-center items-center gap-2">
          <CheckCircle className="w-7 h-7 text-green-600" />
          Payment Submitted!
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mt-3 text-sm">
          {bookingType} {bookingTitle && <span className="font-semibold">{bookingTitle}</span>} has
          been submitted successfully.  
          <br /> We’re now verifying your payment and will send you an email confirmation shortly.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/travel-history')}
            className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-lg shadow-md transition"
          >
            View My Booking
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-lg shadow"
          >
            Back to Home
          </button>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-6">
          Please wait while we review your payment. This usually takes a few minutes.
        </p>
      </motion.div>
    </div>
  );
}
