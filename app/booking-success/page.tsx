'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import successAnim from '@/public/lottie/success.json';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { width, height } = useWindowSize();

  // ✅ Dynamic values
  const type = searchParams.get('type') || 'booking';
  const title = searchParams.get('title') || 'your trip';
  const formattedType =
    type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden px-6 text-center">
      {/* 🎉 Confetti celebration */}
      <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />

      {/* ✅ Bigger Lottie animation */}
      <div className="w-[320px] h-[320px] mb-6">
        <Lottie animationData={successAnim} loop={true} />
      </div>

      {/* Headline */}
      <h1 className="text-4xl font-extrabold text-blue-800 mb-4">
        Payment Successfully Submitted!
      </h1>

      {/* Message */}
      <p className="text-lg text-gray-700 max-w-2xl mb-8">
        🎉 Thank you for uploading your payment proof. <br />
        We’re now reviewing your{' '}
        <span className="font-semibold text-blue-900">{title}</span>{' '}
        {formattedType}. Please wait while our team verifies your payment.  
        You’ll receive an <span className="font-semibold">email confirmation</span> once it’s approved.
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10">
        <button
          onClick={() => router.push('/history')}
          className="px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold shadow-lg hover:bg-blue-800 transition cursor-pointer"
        >
          View My Booking
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition cursor-pointer"
        >
          Back to Home
        </button>
      </div>

      {/* Branding / Affirmation */}
      <div className="absolute bottom-8 text-sm text-gray-600 italic">
        🌊 <span className="font-bold text-blue-800">LUWAS</span> – Travel Smarter, Travel Further.  
        <br />
        Making every journey seamless and unforgettable.
      </div>
    </div>
  );
}
