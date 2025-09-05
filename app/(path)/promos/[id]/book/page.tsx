'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter, useParams } from 'next/navigation';
import PromoBookingForm from '@/components/(promos)/PromoBookingForm';


export default function PromoBookingPage() {
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
    return <p className="text-center py-20 text-lg">Loading booking form...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-6">
      <PromoBookingForm promoId={id} user={user} />
    </div>
  );
}
