'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/client';
import type { User } from 'firebase/auth';
import { Mail, Phone, Calendar, Users, User as UserIcon, Home, Tag } from 'lucide-react';

interface Props {
  promoId: string;
  user: User;
}

interface Promo {
  title: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  imageUrl?: string;
}

function IconInput({ icon: Icon, ...props }: any) {
  return (
    <div className="relative w-full">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        {...props}
        className="pl-10 pr-4 py-3 w-full rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
    </div>
  );
}

export default function PromoBookingForm({ promoId, user }: Props) {
  const [promo, setPromo] = useState<Promo | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    localAddress: '',
    departureDate: '',
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
    const fetchPromo = async () => {
      try {
        const docRef = doc(db, 'promos', promoId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPromo(docSnap.data() as Promo);
        } else {
          toast.error('Promo not found.');
        }
      } catch (error) {
        toast.error('Failed to fetch promo.');
        console.error(error);
      }
    };

    fetchPromo();
  }, [promoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'travelers' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promo) return;
    setLoading(true);

    try {
      const totalPrice = formData.travelers * promo.price;
      const discountApplied = totalPrice * (promo.discountPercentage / 100);
      const finalPrice = totalPrice - discountApplied;

      // ✅ Create booking
      const res = await fetch('/api/promo-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user.uid,
          promoId,
          totalPrice,
          finalPrice,
          paymentMethod: 'PayMongo',
        }),
      });

      if (!res.ok) throw new Error('Failed to create promo booking');
      const data = await res.json();

      toast.success('Booking submitted! Redirecting to payment...');

      // ✅ PayMongo checkout
      const payRes = await fetch('/api/paymongo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          amount: finalPrice,
          bookingId: data.id,
          promoId,
          successType: 'promo',
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
      console.error('Promo booking error:', err);
      toast.error('Something went wrong.');
      setLoading(false);
    }
  };

  if (!promo) return null;

  const totalPrice = formData.travelers * promo.price;
  const discountApplied = totalPrice * (promo.discountPercentage / 100);
  const finalPrice = totalPrice - discountApplied;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-100 px-4 py-10">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-6 md:p-10 rounded-2xl shadow-2xl space-y-6 border border-blue-100"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          {promo.imageUrl && (
            <Image
              src={promo.imageUrl}
              alt={promo.title}
              width={80}
              height={80}
              className="mx-auto mb-4 rounded-lg"
            />
          )}
          <h2 className="text-3xl font-extrabold text-blue-800 mb-2">{promo.title}</h2>
          <p className="text-sm text-gray-600">Special discounted promo just for you</p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IconInput icon={UserIcon} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required />
          <IconInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
          <IconInput icon={Phone} name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
          <IconInput icon={Home} name="localAddress" value={formData.localAddress} onChange={handleChange} placeholder="Local Address" required />
          <IconInput icon={Calendar} type="date" name="departureDate" value={formData.departureDate} onChange={handleChange} required />
          <IconInput icon={Users} type="number" min={1} name="travelers" value={formData.travelers} onChange={handleChange} placeholder="Travelers" required />
        </div>

        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          placeholder="Special Requests"
          rows={3}
          className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
          <p>Price per person: <span className="font-semibold text-blue-800">₱{promo.price.toLocaleString()}</span></p>
          <p>Discount: <span className="font-semibold text-green-600">{promo.discountPercentage}%</span></p>
          <p>Total Price: <span className="font-semibold">₱{totalPrice.toLocaleString()}</span></p>
          <p className="text-lg font-bold text-blue-900">Final Price: ₱{finalPrice.toLocaleString()}</p>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-3 rounded-full font-bold hover:from-blue-700 hover:to-blue-900 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Book Promo Now'}
          </button>
        </div>
      </motion.form>
    </section>
  );
}
