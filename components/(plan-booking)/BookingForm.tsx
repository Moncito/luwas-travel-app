'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner'; // (you already have sonner installed!)

export default function BookingForm({ prefillDestination }: { prefillDestination?: string }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    destination: prefillDestination || '',
    date: '',
    travelers: '',
    specialRequests: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Booking Submitted! ✈️ Thank you for choosing Luwas.');
    console.log('Booking Form Data:', formData);

    // Reset form (optional)
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      destination: '',
      date: '',
      travelers: '',
      specialRequests: '',
    });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-lg max-w-3xl w-full mx-auto space-y-6"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Form Title */}
      <h2 className="text-4xl font-bold text-center mb-10">Let us Craft your Perfect Getaway</h2>

      {/* Traveler Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-gray-700 font-semibold">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold">Destination</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-gray-700 font-semibold">Travel Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <div>
          <label className="text-gray-700 font-semibold">Number of Travelers</label>
          <input
            type="number"
            name="travelers"
            value={formData.travelers}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      {/* Special Requests */}
      <div>
        <label className="text-gray-700 font-semibold">Special Requests</label>
        <textarea
          name="specialRequests"
          value={formData.specialRequests}
          onChange={handleChange}
          rows={4}
          placeholder="Allergies? Celebrating something special? Let us know!"
          className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="submit"
          className="bg-black text-white py-3 px-8 rounded-full hover:bg-gray-800 transition-all font-bold shadow-lg"
        >
          🚀 Book My Adventure
        </button>
      </div>
    </motion.form>
  );
}
