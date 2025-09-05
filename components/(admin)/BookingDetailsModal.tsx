'use client';

import { Dialog } from '@headlessui/react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  BadgeInfo,
  CloudSun,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    fullName: string;
    email: string;
    phone?: string; // ✅ optional now
    destination: string;
    departureDate: string;
    status: string;
    proofUrl?: string;
    weather?: {
      condition: string;
      temperature: number;
      humidity?: number;
      icon?: string;
    };
  };
  onStatusChange: (id: string, newStatus: string) => void;
  type?: 'destination' | 'itinerary';
}

export default function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
  onStatusChange,
  type = 'destination',
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true);
    try {
      const endpoint =
        type === 'destination'
          ? `/api/bookings/${booking.id}/status`
          : `/api/itinerary-bookings/${booking.id}/status`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      toast.success(`Booking marked as ${newStatus}`);
      onStatusChange(booking.id, newStatus);
      onClose();
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
        >
          <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white/70 shadow-2xl backdrop-blur-md border border-blue-100 p-6">
            {/* Title */}
            <Dialog.Title className="text-2xl font-extrabold text-blue-900 mb-6 flex items-center gap-2">
              <BadgeInfo className="w-6 h-6" /> Booking Information
            </Dialog.Title>

            {/* Info Section */}
            <div className="space-y-4 text-sm text-blue-900">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>
                  <strong>Email:</strong> {booking.email}
                </span>
              </div>

              {booking.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>
                    <strong>Phone:</strong> {booking.phone}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>
                  <strong>{type === 'destination' ? 'Destination' : 'Itinerary'}:</strong>{' '}
                  {booking.destination}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>
                  <strong>Departure:</strong> {booking.departureDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <BadgeInfo className="w-4 h-4" />
                <span>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                      booking.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </span>
              </div>
            </div>

            {/* Weather Section */}
            {booking.weather && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-4">
                {booking.weather.icon ? (
                  <img
                    src={booking.weather.icon}
                    alt={booking.weather.condition}
                    className="w-12 h-12"
                  />
                ) : (
                  <CloudSun className="w-10 h-10 text-blue-500" />
                )}
                <div>
                  <p className="text-blue-900 font-semibold">
                    {booking.weather.condition}
                  </p>
                  <p className="text-sm text-blue-700">
                    {booking.weather.temperature}°C{' '}
                    {booking.weather.humidity
                      ? `| Humidity: ${booking.weather.humidity}%`
                      : ''}
                  </p>
                </div>
              </div>
            )}

            {/* Proof of Payment */}
            {booking.proofUrl && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-blue-800 mb-2">
                  Uploaded Receipt:
                </p>
                <a
                  href={booking.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={booking.proofUrl}
                    alt="Receipt"
                    width={400}
                    height={300}
                    className="rounded-lg border hover:shadow-md transition"
                  />
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8">
              {booking.status !== 'paid' && (
                <button
                  onClick={() => handleStatusUpdate('paid')}
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  {loading ? 'Approving...' : 'Approve'}
                </button>
              )}
              {booking.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={loading}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition"
                >
                  <XCircle className="w-4 h-4" />
                  {loading ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </motion.div>
      </div>
    </Dialog>
  );
}
