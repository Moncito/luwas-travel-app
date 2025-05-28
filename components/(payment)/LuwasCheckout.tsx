'use client';

import Image from 'next/image';
import { useState } from 'react';
import { db } from '@/firebase/client';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';


interface Props {
  imageUrl: string;
  title: string;
  subtitle: string;
  price: number;
  userEmail: string;
  userName: string;
  userId: string;
  destinationId: string;
}

export default function LuwasCheckout({
  imageUrl,
  title,
  subtitle,
  price,
  userEmail,
  userName,
  userId,
  destinationId,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1: Create booking in Firestore
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        userId,
        destinationId,
        name: userName,
        email: userEmail,
        amount: price,
        createdAt: serverTimestamp(),
        paid: false,
      });

      const bookingId = bookingRef.id;

      // Step 2: Call PayMongo API to create payment link
      const res = await fetch('/api/paymongo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          amount: price,
          bookingId,
          destinationId,
        }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert('❌ Payment creation failed.');
        setLoading(false);
      }
    } catch (err) {
      console.error('[Checkout Error]', err);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-6">
      <div className="bg-white shadow-xl rounded-xl max-w-5xl w-full flex flex-col md:flex-row overflow-hidden">
        {/* Booking Summary */}
        <div className="md:w-1/2 p-8 bg-gray-100">
          <h2 className="text-xl font-semibold mb-4">You are booking</h2>
          <p className="text-3xl font-bold text-blue-700 mb-4">₱{price.toLocaleString()}</p>
          <Image
            src={imageUrl}
            alt="Trip Image"
            width={500}
            height={300}
            className="rounded-md w-full object-cover"
          />
          <h3 className="text-lg font-semibold mt-4">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>

        {/* Checkout Button */}
        <div className="md:w-1/2 p-8">
          <h2 className="text-xl font-bold mb-4">Confirm and Pay</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Email</label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name</label>
              <input
                type="text"
                disabled
                value={userName}
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-600 shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ₱${price.toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
