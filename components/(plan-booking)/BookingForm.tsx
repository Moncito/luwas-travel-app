'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';

const DESTINATION_NAME_MAP: Record<string, string> = {
  'boracay-island': 'Boracay Island',
  'banaue-rice-terraces': 'Banaue Rice Terraces',
  'el-nido': 'El Nido',
};

const PRICE_PER_PERSON = 3000; // 💸 adjust as needed

export default function BookingForm({ destinationId }: { destinationId: string }) {
  const destinationName = DESTINATION_NAME_MAP[destinationId] || 'Unknown Destination';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    localAddress: '',
    destination: destinationName,
    departureDate: '',
    returnDate: '',
    travelers: 1,
    specialRequests: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'travelers' ? +value : value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Booking Submitted! ✈️');
    console.log('Booking Data:', formData);
    // Reset if needed
  };

  const totalPrice = formData.travelers * PRICE_PER_PERSON;

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
        {/* Optional Logo */}
        <div className="text-center">
          <Image src="/logo.png" alt="Luwas Logo" width={60} height={60} className="mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-black mb-2">Let us Craft your Getaway</h2>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-sm text-gray-700">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="input-style"
            />
          </div>
          <div>
            <label className="font-medium text-sm text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input-style"
            />
          </div>
          <div>
            <label className="font-medium text-sm text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="input-style"
            />
          </div>
          <div>
            <label className="font-medium text-sm text-gray-700">Local Address</label>
            <input
              type="text"
              name="localAddress"
              required
              value={formData.localAddress}
              onChange={handleChange}
              placeholder="e.g., Quezon City, Metro Manila"
              className="input-style"
            />
          </div>
        </div>

        {/* Travel Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium text-sm text-gray-700">Departure Date</label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              className="input-style"
            />
          </div>
          <div>
            <label className="font-medium text-sm text-gray-700">Return Date</label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              className="input-style"
            />
          </div>
          <div>
            <label className="font-medium text-sm text-gray-700">Travelers</label>
            <input
              type="number"
              name="travelers"
              value={formData.travelers}
              min={1}
              onChange={handleChange}
              className="input-style"
            />
          </div>
          <div>
            <label className="font-medium text-sm text-gray-700">Destination</label>
            <input
              type="text"
              name="destination"
              disabled
              value={formData.destination}
              className="input-style bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label className="font-medium text-sm text-gray-700">Special Requests</label>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows={3}
            placeholder="e.g., Birthday trip, allergies, etc."
            className="input-style"
          />
        </div>

        {/* Total Price */}
        <div className="text-right font-medium text-sm text-gray-600">
          Total Price: <span className="font-bold text-black">₱{totalPrice.toLocaleString()}</span>
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            className="bg-black text-white py-3 px-8 rounded-full hover:bg-gray-800 transition font-bold shadow-lg"
          >
            🚀 Book My Adventure
          </button>
        </div>
      </motion.form>

      <style jsx>{`
        .input-style {
          width: 100%;
          padding: 0.75rem 1rem;
          margin-top: 0.25rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          outline: none;
          transition: box-shadow 0.3s ease;
        }

        .input-style:focus {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
          border-color: #3b82f6;
        }
      `}</style>
    </section>
  );
}
