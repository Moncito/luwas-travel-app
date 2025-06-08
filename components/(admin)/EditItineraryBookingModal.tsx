'use client';

import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { toast } from 'sonner';
import { Dialog } from '@headlessui/react';
import { motion } from 'framer-motion';

interface Props {
  booking: {
    id: string;
    name: string;
    email: string;
    date: string;
    people: number;
    slug?: string;
    status?: string;
  };
  onClose: () => void;
  onUpdated: () => void;
}

const statuses = ['upcoming', 'paid', 'completed', 'cancelled', 'waiting_payment'];

export default function EditItineraryBookingModal({ booking, onClose, onUpdated }: Props) {
  const [form, setForm] = useState({
    name: booking.name || '',
    email: booking.email || '',
    date: booking.date || '',
    people: booking.people || 1,
    status: booking.status || 'upcoming',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'people' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'itineraryBookings', booking.id), {
        ...form,
        people: Number(form.people),
      });
      toast.success('🛫 Itinerary booking updated!');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error('❌ Failed to update itinerary booking.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
        >
          <Dialog.Panel className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-blue-100 max-w-lg w-full">
            <Dialog.Title className="text-2xl font-bold text-blue-800 mb-4">
              Edit Itinerary Booking
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4 text-blue-900">
              <div>
                <label className="block text-sm font-medium">Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Travel Date</label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">No. of People</label>
                <input
                  name="people"
                  type="number"
                  min="1"
                  value={form.people}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-full bg-blue-700 text-white hover:bg-blue-800"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
}
