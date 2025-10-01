'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import type { TravelRecord } from '@/types/travel'
import Image from 'next/image'
import { Mail, Phone, CalendarDays, MapPin, CloudSun, FileText, X } from 'lucide-react'

interface Props {
  booking: TravelRecord | null
  isOpen: boolean
  onClose: () => void
}

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-800',
  waiting_payment: 'bg-yellow-100 text-yellow-700',
  pending_payment: 'bg-orange-100 text-orange-700',
  awaiting_approval: 'bg-purple-100 text-purple-700',
}

export default function BookingDetailModal({ booking, isOpen, onClose }: Props) {
  const [showFullReceipt, setShowFullReceipt] = useState(false)

  if (!booking) return null

  return (
    <>
      {/* Main Modal */}
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 space-y-6">
            {/* Header */}
            <Dialog.Title className="text-xl font-bold text-blue-700 flex items-center justify-between">
              {booking.type === 'trip' && booking.destination}
              {booking.type === 'itinerary' && (booking.title || booking.slug || 'Itinerary Booking')}
              {booking.type === 'promo' && (booking.promoTitle || 'Promo Booking')}

              {booking.status && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    statusColors[booking.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {booking.status.replace('_', ' ')}
                </span>
              )}
            </Dialog.Title>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Info */}
              <div className="space-y-3 text-sm text-gray-700">
                {booking.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    {booking.email}
                  </p>
                )}

                {booking.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" />
                    {booking.phone}
                  </p>
                )}

                {booking.departureDate && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-500" />
                    {booking.departureDate}
                  </p>
                )}

                {booking.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    {booking.location}
                  </p>
                )}

                {booking.travelers != null && (
                  <p><strong>Travelers:</strong> {booking.travelers}</p>
                )}

                {booking.people != null && (
                  <p><strong>People:</strong> {booking.people}</p>
                )}

                {booking.totalPrice != null && (
                  <p className="font-semibold text-emerald-600">
                    Total Price: ₱{Number(booking.totalPrice).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Right Side */}
              <div className="space-y-4">
                {/* Receipt */}
                {booking.proofUrl && (
                  <div className="p-3 border rounded-lg bg-gray-50 shadow-sm">
                    <p className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> Receipt
                    </p>
                    <Image
                      src={booking.proofUrl}
                      alt="Receipt Preview"
                      width={200}
                      height={120}
                      className="rounded-lg border cursor-pointer object-contain hover:shadow-md transition"
                      onClick={() => setShowFullReceipt(true)}
                    />
                    <p
                      className="text-xs text-blue-600 mt-1 text-center hover:underline cursor-pointer"
                      onClick={() => setShowFullReceipt(true)}
                    >
                      View full receipt
                    </p>
                  </div>
                )}

                {/* Weather */}
                {booking.weather && (
                  <div className="p-3 rounded-lg border bg-blue-50 flex items-center gap-3">
                    {booking.weather.icon ? (
                      <img
                        src={booking.weather.icon}
                        alt={booking.weather.condition || 'Weather'}
                        className="w-10 h-10"
                      />
                    ) : (
                      <CloudSun className="w-10 h-10 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium">{booking.weather.condition || 'Unknown'}</p>
                      {booking.weather.temperature != null && (
                        <p className="text-sm text-gray-600">
                          {booking.weather.temperature}°C
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center mt-6">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Full Receipt Lightbox */}
      <Dialog open={showFullReceipt} onClose={() => setShowFullReceipt(false)} className="relative z-[60]">
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowFullReceipt(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <Image
              src={booking?.proofUrl || ''}
              alt="Full Receipt"
              width={800}
              height={600}
              className="rounded-lg shadow-lg mx-auto"
            />
          </div>
        </div>
      </Dialog>
    </>
  )
}
