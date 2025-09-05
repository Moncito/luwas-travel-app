'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PromoBookingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    travelers: 1,
    departureDate: '',
    paymentMethod: 'gcash',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/promo-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, promoId: id }),
      });

      if (!res.ok) throw new Error(`Failed with status ${res.status}`);

      toast.success('🎉 Promo booking confirmed!');
      router.push('/promos'); // redirect to promos list or success page
    } catch (err) {
      console.error('❌ Error creating booking:', err);
      toast.error('Failed to book promo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-bold text-blue-900 mb-6">Book Promo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-4 py-2"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-4 py-2"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        />
        <input
          type="number"
          name="travelers"
          placeholder="Travelers"
          value={form.travelers}
          onChange={handleChange}
          min={1}
          className="w-full border rounded-lg px-4 py-2"
        />
        <input
          type="date"
          name="departureDate"
          value={form.departureDate}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-4 py-2"
        />
        <select
          name="paymentMethod"
          value={form.paymentMethod}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="gcash">GCash</option>
          <option value="paypal">PayPal</option>
          <option value="paymongo">PayMongo</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow"
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  );
}
