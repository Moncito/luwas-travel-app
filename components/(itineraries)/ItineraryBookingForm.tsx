'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/client';
import type { User } from 'firebase/auth';

interface Props {
  slug: string;
  user: User;
}

interface Itinerary {
  id: string;
  title: string;
  slug: string;
  price: number;
}

export default function ItineraryBookingForm({ slug, user }: Props) {
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    people: '1',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const q = query(collection(db, 'itineraries'), where('slug', '==', slug));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          router.push('/404');
          return;
        }
        const doc = snapshot.docs[0];
        setItinerary({ id: doc.id, ...doc.data() } as Itinerary);
      } catch (err) {
        console.error('Fetch error:', err);
        toast.error('Unable to load itinerary.');
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [slug, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinerary) return;

    const total = itinerary.price * Number(formData.people);
    setLoading(true);

    try {
      const bookingRef = await addDoc(collection(db, 'itineraryBookings'), {
        ...formData,
        userId: user.uid,
        people: Number(formData.people),
        itineraryId: itinerary.id,
        slug,
        title: itinerary.title,
        totalPrice: total,
        status: 'upcoming',
        paid: false,
        createdAt: serverTimestamp(),
      });

      const res = await fetch('/api/paymongo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          amount: total,
          bookingId: bookingRef.id,
          itinerarySlug: slug,
          successType: 'itinerary',
        }),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('❌ Payment failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('❌ Failed to submit booking.');
      setLoading(false);
    }
  };

  const totalPrice = itinerary ? itinerary.price * Number(formData.people) : 0;

  if (loading || !itinerary) {
    return <p className="text-center text-lg mt-16">Loading itinerary details...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-white">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl p-8 rounded-xl shadow-lg bg-white space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-blue-800 text-center">
          Book Your Itinerary
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-style"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-style"
          />
          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="input-style"
          />
          <input
            name="address"
            placeholder="Local Address"
            value={formData.address}
            onChange={handleChange}
            className="input-style"
          />
          <input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input-style"
          />
          <input
            name="people"
            type="number"
            min="1"
            value={formData.people}
            onChange={handleChange}
            className="input-style"
          />
        </div>

        <input
          value={itinerary.title}
          readOnly
          className="w-full p-3 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
        />

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Special Requests (optional)"
          className="w-full p-3 border rounded-md"
        />

        <div className="flex justify-between items-center">
          <p className="font-medium text-blue-900">
            Total Price:{' '}
            <span className="font-bold">₱{totalPrice.toLocaleString()}</span>
          </p>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-3 rounded-full hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
