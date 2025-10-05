'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import successAnim from '@/public/lottie/success.json';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function BookingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { width, height } = useWindowSize();

  // ✅ Dynamic values
  const type = searchParams.get('type') || 'booking';
  const title = searchParams.get('title') || 'your trip';
  const formattedType =
    type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  // 📝 Review states
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔥 Firestore submission
  const handleSubmitReview = async () => {
    if (rating === 0 || comment.trim() === '') {
      toast.error('⚠️ Please add a rating and comment before submitting.');
      return;
    }

    try {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        toast.error('🔒 You must be logged in to leave a review.');
        setLoading(false);
        return;
      }

      // 💡 Smart name fallback
      const displayName =
        user.displayName && user.displayName.trim() !== ''
          ? user.displayName
          : user.email
          ? user.email.split('@')[0]
          : 'Traveler';

      // 🧾 Store review in Firestore
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        name: displayName,
        title,
        rating,
        comment,
        type,
        createdAt: serverTimestamp(),
      });

      toast.success(`🌟 Thank you for your feedback, ${displayName}!`);
      setRating(0);
      setComment('');
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('❌ Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden px-6 text-center pb-32 sm:pb-24">
      {/* 🎉 Confetti */}
      <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />

      {/* ✅ Lottie animation */}
      <div className="w-[260px] sm:w-[320px] h-[260px] sm:h-[320px]">
        <Lottie animationData={successAnim} loop={true} />
      </div>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-800 mb-4">
        Payment Successfully Submitted!
      </h1>

      {/* Message */}
      <p className="text-base sm:text-lg text-gray-700 max-w-2xl mb-8 leading-relaxed">
        🎉 Thank you for uploading your payment proof. <br />
        We’re now reviewing your{' '}
        <span className="font-semibold text-blue-900">{title}</span>{' '}
        {formattedType}. Please wait while our team verifies your payment.  
        You’ll receive an <span className="font-semibold">email confirmation</span> once it’s approved.
      </p>

      {/* Buttons */}
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

      {/* ✨ Review Section */}
      <div className="w-full max-w-md sm:max-w-lg bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-5 sm:p-6 border border-blue-100 mb-20 mx-auto">
        <h2 className="text-2xl font-bold text-blue-800 mb-3">
          Share Your Experience 🌴
        </h2>
        <p className="text-gray-700 mb-4">
          How was your booking process for{' '}
          <span className="font-semibold">{title}</span>?
        </p>

        {/* Rating Stars */}
        <div className="flex justify-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className={`text-3xl transition ${
                star <= (hoveredStar || rating)
                  ? 'text-yellow-400 scale-110'
                  : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          placeholder="Write your feedback here..."
          className="w-full h-28 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none mb-4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>

        {/* Submit */}
        <button
          onClick={handleSubmitReview}
          disabled={loading}
          className={`w-full font-semibold py-3 rounded-lg transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-blue-700 hover:bg-blue-800 text-white'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>

      {/* Branding */}
      <div className="absolute bottom-6 sm:bottom-8 text-xs sm:text-sm text-gray-600 italic text-center">
        🌊 <span className="font-bold text-blue-800">LUWAS</span> – Travel Smarter, Travel Further.  
        <br className="hidden sm:block" />
        Making every journey seamless and unforgettable.
      </div>
    </div>
  );
}
