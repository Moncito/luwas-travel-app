'use client';

import BookingForm from '@/components/(plan-booking)/BookingForm';
import { useParams } from 'next/navigation';

export default function BookingPage() {
  const { id } = useParams();

  if (!id || typeof id !== 'string') return null;

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-6">
      <BookingForm destinationId={id} />
    </div>
  );
}