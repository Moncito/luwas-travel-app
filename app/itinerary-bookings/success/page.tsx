'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Home, MapPin, CheckCircle } from 'lucide-react';
import SubmitReviewForm from '@/components/(map-reviews)/SubmitReviewForm';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function ItineraryBookingSuccessPage() {
  const searchParams = useSearchParams();
  const [itinerarySlug, setItinerarySlug] = useState<string | null>(null);
  const { width, height } = useWindowSize();

  // ✅ Safely load the slug client-side
  useEffect(() => {
    const slug = searchParams.get('itinerary');
    if (slug) setItinerarySlug(slug);
  }, [searchParams]);

  if (!itinerarySlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <p className="text-gray-500">Missing itinerary information. Please try booking again.</p>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative min-h-screen bg-cover bg-center flex flex-col items-center justify-center px-6 pb-12 text-center"
      style={{
        backgroundImage: `url('/images/booking-bg.png')`, // match the booking success background
      }}
    >
      {/* Confetti */}
      <Confetti width={width} height={height} numberOfPieces={150} recycle={false} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-0"></div>

      {/* Content */}
      <div className="z-10">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/90 rounded-2xl shadow-xl p-10 max-w-xl w-full space-y-4 border border-blue-100"
        >
          <CheckCircle className="text-green-500 w-12 h-12 mx-auto animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-800 animate-[blinker_2s_ease-in-out_infinite]">
            Itinerary Booked!
          </h1>
          <p className="text-gray-600">
            Thank you for booking with <span className="font-semibold text-blue-600">Luwas</span>. 
            We can’t wait for you to start your adventure.
          </p>
        </motion.div>

        {/* Buttons */}
        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm bg-white border border-gray-300 px-5 py-2.5 rounded-full text-gray-700 hover:bg-gray-100 transition"
          >
            <Home size={18} /> Go Back to Home
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 text-sm bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition"
          >
            <MapPin size={18} /> View My Trips
          </Link>
        </div>

        {/* Review Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 w-full max-w-xl"
        >
          <SubmitReviewForm itinerarySlug={itinerarySlug} />
        </motion.div>
      </div>

      {/* Blinker animation */}
      <style jsx>{`
        @keyframes blinker {
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </motion.main>
  );
}
