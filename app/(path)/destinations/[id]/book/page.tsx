'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter, useParams } from 'next/navigation';
import BookingForm from '@/components/(plan-booking)/BookingForm';
import { Calendar } from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/sign-in');
      } else {
        setUser(currentUser);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (checkingAuth || !id || typeof id !== 'string' || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-700 font-medium">Preparing your booking form...</p>
        <p className="text-sm text-gray-500">Please wait while we load the details</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-orange-50 py-12 px-6">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="flex flex-col items-center gap-3">
          {/* Branding Title */}
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-orange-500">⛺</span>
            <span className="text-blue-800">Luwas Travel</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 flex items-center gap-2">
            <Calendar size={26} className="text-blue-700" />
            Confirm Your Destination Booking
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            "Plan smarter, travel smoother — book your destination with Luwas today."
          </p>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-6xl mx-auto">
        <BookingForm destinationId={id} user={user} />
      </div>
    </div>
  );
}
