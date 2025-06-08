'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { BadgeInfo, Loader2 } from 'lucide-react';
import type { Booking } from '@/types/booking';

interface Props {
  booking: Booking;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditBookingModal({ booking, onClose, onUpdated }: Props) {
  const [status, setStatus] = useState<Booking['status']>(booking.status);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update booking.');

      toast.success('🎉 Booking status updated!');
      onUpdated();
      onClose();
    } catch (err) {
      toast.error('⚠️ Update failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md rounded-2xl bg-white/80 p-6 shadow-xl backdrop-blur border border-blue-100"
      >
        <h2 className="text-xl font-bold text-blue-900 mb-5 flex items-center gap-2">
          <BadgeInfo className="w-5 h-5" />
          Edit Booking Status
        </h2>

        <div className="space-y-3 text-sm text-blue-900">
          <p><strong>Destination:</strong> {booking.destination}</p>
          <p><strong>Name:</strong> {booking.fullName}</p>
          <p><strong>Email:</strong> {booking.email}</p>
          <label className="block mt-3 text-sm font-semibold">Update Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Booking['status'])}
            className="w-full border border-blue-200 rounded-lg p-2 bg-white text-sm shadow-sm"
          >
            {['upcoming', 'paid', 'completed', 'cancelled', 'waiting_payment'].map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-medium flex items-center gap-2 text-sm transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
