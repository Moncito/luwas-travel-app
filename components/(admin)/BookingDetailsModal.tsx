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
    phone?: string;
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
    price?: number;
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="w-full max-w-4xl"
        >
          <Dialog.Panel className="w-full rounded-xl bg-white shadow-2xl border border-gray-200 p-6">
            <Dialog.Title className="text-2xl font-extrabold text-blue-900 mb-6 flex items-center gap-2">
              <BadgeInfo className="w-6 h-6" /> Booking Information
            </Dialog.Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side – booking info */}
              <div className="space-y-4 text-sm text-blue-900">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span><strong>Email:</strong> {booking.email}</span>
                </div>

                {booking.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span><strong>Phone:</strong> {booking.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    <strong>{type === 'destination' ? 'Destination' : 'Itinerary'}:</strong> {booking.destination}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span><strong>Departure:</strong> {booking.departureDate}</span>
                </div>
                
                {booking.price && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">💰 Total Price:</span>
                  <span className="text-blue-700 font-semibold">
                    ₱{booking.price.toLocaleString()}
                  </span>
                </div>
              )}


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

                {/* Weather Info */}
                {booking.weather && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-4">
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
                      <p className="font-semibold">{booking.weather.condition}</p>
                      <p className="text-sm">
                        {booking.weather.temperature}°C{' '}
                        {booking.weather.humidity ? `| Humidity: ${booking.weather.humidity}%` : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right side – receipt */}
              {booking.proofUrl && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-blue-800">Uploaded Receipt:</p>
                  <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
                    <Image
                      src={booking.proofUrl}
                      alt="Receipt Preview"
                      width={400}
                      height={250}
                      className="object-contain max-h-[250px]"
                    />
                  </div>
                  <a
                    href={booking.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    🔍 View Full Receipt
                  </a>
                </div>
              )}
            </div>

            {/* Actions */}
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
