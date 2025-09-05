'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/client';
import type { User } from 'firebase/auth';
import { Mail, Phone, Calendar, Home, Users, User as UserIcon } from 'lucide-react';

interface Props {
  destinationId: string;
  user: User;
}

interface Destination {
  name: string;
  price: number;
  latitude: number;
  longitude: number;
}

function IconInput({ icon: Icon, ...props }: any) {
  return (
    <div className="relative w-full">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        {...props}
        className="pl-10 pr-4 py-3 w-full rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
      />
    </div>
  );
}

export default function BookingForm({ destinationId, user }: Props) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [pricePerPerson, setPricePerPerson] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    localAddress: '',
    departureDate: '',
    returnDate: '',
    travelers: 1,
    specialRequests: '',
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
    const fetchDestination = async () => {
      try {
        const docRef = doc(db, 'destinations', destinationId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Destination;
          setDestination(data);
          setPricePerPerson(data.price || 0);
        } else {
          toast.error('Destination not found.');
        }
      } catch (error) {
        toast.error('Failed to fetch destination.');
        console.error(error);
      }
    };

    fetchDestination();
  }, [destinationId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'travelers' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalPrice = formData.travelers * pricePerPerson;

      // ✅ Call API route instead of addDoc
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user.uid,
          destinationId,
          totalPrice,
          paymentMethod: 'PayMongo',
        }),
      });

      if (!res.ok) throw new Error('Failed to create booking');
      const data = await res.json();

      toast.success('Booking submitted! Redirecting to payment...');

      // ✅ Now continue with PayMongo checkout
      const payRes = await fetch('/api/paymongo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          amount: totalPrice,
          bookingId: data.id, // returned from API
          destinationId,
          successType: 'destination',
        }),
      });

      const payData = await payRes.json();
      if (payData?.url) {
        setTimeout(() => {
          window.location.href = payData.url;
        }, 1200);
      } else {
        toast.error('❌ Payment failed. Try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Something went wrong.');
      setLoading(false);
    }
  };

  const totalPrice = formData.travelers * pricePerPerson;
  if (!destination) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-orange-50 px-4 py-10">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-6 border border-orange-100"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          <Image src="/logo.png" alt="Luwas Logo" width={60} height={60} className="mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-orange-500 mb-2">
            Let Us Craft Your Getaway
          </h2>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IconInput icon={UserIcon} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required />
          <IconInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          <IconInput icon={Phone} name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
          <IconInput icon={Home} name="localAddress" value={formData.localAddress} onChange={handleChange} placeholder="Local Address" required />
          <IconInput icon={Calendar} type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} required />
          <IconInput icon={Calendar} type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} />
          <IconInput icon={Users} type="number" min={1} name="travelers" value={formData.travelers} onChange={handleChange} placeholder="Travelers" required />
          <input
            value={destination.name}
            disabled
            className="w-full p-3 rounded-md bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed"
          />
        </div>

        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          placeholder="Special Requests"
          rows={3}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        />

        <div className="text-right text-base text-blue-900 font-semibold">
          Total Price: <span className="text-orange-600">₱{totalPrice.toLocaleString()}</span>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold hover:from-orange-600 hover:to-blue-800 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Book My Adventure'}
          </button>
        </div>
      </motion.form>
    </section>
  );
}
