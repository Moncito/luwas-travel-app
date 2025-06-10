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
import { Mail, Phone, Calendar, Home, Users, User as UserIcon } from 'lucide-react';

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

function IconInput({ icon: Icon, ...props }: any) {
  return (
    <div className="relative w-full">
      <Icon className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        {...props}
        className="pl-10 pr-4 py-3 w-full rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
      />
    </div>
  );
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
        fullName: user.displayName || '',
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
        console.error('Error loading itinerary:', err);
        toast.error('Failed to load itinerary.');
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

    const totalPrice = itinerary.price * Number(formData.people);
    setLoading(true);

    try {
      const bookingRef = await addDoc(collection(db, 'itineraryBookings'), {
        ...formData,
        userId: user.uid,
        itineraryId: itinerary.id,
        title: itinerary.title,
        slug,
        people: Number(formData.people),
        totalPrice,
        status: 'upcoming',
        paid: false,
        createdAt: serverTimestamp(),
      });

      toast.success('Booking submitted! Redirecting to payment...');

      const res = await fetch('/api/paymongo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          amount: totalPrice,
          bookingId: bookingRef.id,
          itinerarySlug: slug,
          successType: 'itinerary',
        }),
      });

      const data = await res.json();
      if (data?.url) {
        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
      } else {
        toast.error('❌ Payment session failed.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('❌ Booking submission failed.');
      setLoading(false);
    }
  };

  const totalPrice = itinerary ? itinerary.price * Number(formData.people) : 0;
  if (loading || !itinerary) {
    return <p className="text-center text-lg mt-20">Loading itinerary details...</p>;
  }

  return (
    <div className="min-h-screen px-4 py-8 flex justify-center items-start bg-white">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl px-6 py-8 sm:p-10 rounded-3xl shadow-xl bg-gradient-to-br from-white via-blue-50 to-orange-50 border border-orange-100 space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-orange-500">
          Reserve Your Journey
        </h2>
        <p className="text-center text-blue-600 font-medium">
          {itinerary.title} — <span className="text-orange-600 font-semibold">₱{itinerary.price.toLocaleString()}</span> / person
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <IconInput icon={UserIcon} name="fullName" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
          <IconInput icon={Mail} name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          <IconInput icon={Phone} name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
          <IconInput icon={Home} name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
          <IconInput icon={Calendar} name="date" type="date" value={formData.date} onChange={handleChange} required />
          <IconInput icon={Users} name="people" type="number" min="1" value={formData.people} onChange={handleChange} placeholder="No. of Travelers" />
        </div>

        <input
          value={itinerary.title}
          readOnly
          className="w-full p-3 rounded-md bg-gray-100 text-center text-gray-500 font-medium cursor-not-allowed border border-gray-300"
        />

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Special requests or notes"
          className="w-full p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-orange-400"
        />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-lg font-semibold text-blue-800 text-center sm:text-left">
            Total: <span className="text-orange-600">₱{totalPrice.toLocaleString()}</span>
          </p>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 transition text-white px-6 py-3 rounded-full font-bold w-full sm:w-auto disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Book & Proceed to Payment'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
