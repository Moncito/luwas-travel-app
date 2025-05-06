'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/client';

interface Props {
  destinationId: string;
}

export default function BookingForm({ destinationId }: Props) {
  const [destination, setDestination] = useState<any>(null);
  const [pricePerPerson, setPricePerPerson] = useState(0);

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
    const fetchDestination = async () => {
      try {
        const docRef = doc(db, 'destinations', destinationId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDestination(docSnap.data());
          setPricePerPerson(docSnap.data().price || 0);
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
    setFormData({ ...formData, [name]: name === 'travelers' ? +value : value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Booking Submitted!');
    console.log('Booking Data:', { ...formData, destination: destination?.name });
  };

  if (!destination) return null;

  const totalPrice = formData.travelers * pricePerPerson;

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-6 md:p-10 rounded-xl shadow-lg space-y-6"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          <Image src="/logo.png" alt="Luwas Logo" width={60} height={60} className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-black mb-2">Let us Craft your Getaway</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" className="input-style" required />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="input-style" required />
          <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="input-style" required />
          <input name="localAddress" value={formData.localAddress} onChange={handleChange} placeholder="Local Address" className="input-style" required />
          <input name="departureDate" type="date" value={formData.departureDate} onChange={handleChange} className="input-style" />
          <input name="returnDate" type="date" value={formData.returnDate} onChange={handleChange} className="input-style" />
          <input name="travelers" type="number" min={1} value={formData.travelers} onChange={handleChange} className="input-style" />
          <input value={destination.name} disabled className="input-style bg-gray-100 cursor-not-allowed" />
        </div>

        <textarea name="specialRequests" value={formData.specialRequests} onChange={handleChange} placeholder="Special Requests" rows={3} className="input-style" />

        <div className="text-right text-sm">
          Total Price: <strong>₱{totalPrice.toLocaleString()}</strong>
        </div>

        <div className="text-center">
          <button type="submit" className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all">
            Book My Adventure
          </button>
        </div>

        <style jsx>{`
          .input-style {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            margin-top: 0.25rem;
          }

          .input-style:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }
        `}</style>
      </motion.form>
    </section>
  );
}
