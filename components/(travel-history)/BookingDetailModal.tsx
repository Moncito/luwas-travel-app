'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import type { TravelRecord } from '@/types/travel'
import Image from 'next/image'
import { getAuth } from 'firebase/auth'
import CancellationModal from './CancellationModal'
import {
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  CloudSun,
  FileText,
  X,
  User as UserIcon,
  Home,
  CreditCard,
  Trash2,
} from 'lucide-react'

interface Props {
  booking: TravelRecord | null
  isOpen: boolean
  onClose: () => void
  onBookingUpdated?: () => void
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

export default function BookingDetailModal({ booking, isOpen, onClose, onBookingUpdated }: Props) {
  const [showFullReceipt, setShowFullReceipt] = useState(false)
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const canCancel =
    booking && 
    booking.status && 
    ['upcoming', 'pending_payment', 'waiting_payment', 'paid', 'awaiting_approval'].includes(booking.status.toLowerCase())

  const handleCancellation = async (reason: string, details?: string) => {
    if (!booking) return

    setIsCancelling(true)
    try {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) throw new Error('Not authenticated')

      const token = await user.getIdToken()

      const res = await fetch(`/api/travel-history/${booking.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason,
          details,
          bookingType: booking.type,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to cancel booking')
      }

      // Notify parent component to refresh data
      onBookingUpdated?.()
      setShowCancellationModal(false)
      setTimeout(() => onClose(), 1500)
    } catch (err: any) {
      throw err
    } finally {
      setIsCancelling(false)
    }
  }

  if (!booking) return null

  // Pricing logic
  const isPromo = booking.type === 'promo'
  const originalPrice = booking.totalPrice ?? booking.finalPrice ?? 0
  const finalPrice = booking.finalPrice ?? booking.totalPrice ?? 0
  const hasDiscount =
    isPromo && booking.finalPrice != null && booking.finalPrice < (booking.totalPrice ?? 0)

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-lg md:max-w-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <Dialog.Title className="text-xl md:text-2xl font-bold text-blue-700 flex items-center justify-between">
              {booking.type === 'trip' && booking.destination}
              {booking.type === 'itinerary' && (booking.title || booking.slug || 'Itinerary Booking')}
              {booking.type === 'promo' && (booking.promoTitle || 'Promo Booking')}

              {booking.status && (
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    statusColors[booking.status] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {booking.status.replace('_', ' ')}
                </span>
              )}
            </Dialog.Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Info */}
              <div className="space-y-4 text-sm text-gray-700">
                <h3 className="font-semibold text-blue-800">Traveler Info</h3>
                <p className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-500" /> {booking.fullName}
                </p>
                {booking.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" /> {booking.email}
                  </p>
                )}
                {booking.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" /> {booking.phone}
                  </p>
                )}
                {booking.location && (
                  <p className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-blue-500" /> {booking.location}
                  </p>
                )}

                <h3 className="font-semibold text-blue-800 pt-2">Booking Info</h3>
                {booking.departureDate && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-blue-500" /> {booking.departureDate}
                  </p>
                )}
                {booking.people != null && <p>People: {booking.people}</p>}
                {booking.travelers != null && <p>Travelers: {booking.travelers}</p>}
                {booking.specialRequests && <p className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> {booking.specialRequests}</p>}
              </div>

              {/* Right Side */}
              <div className="space-y-4">
                <h3 className="font-semibold text-blue-800">Payment</h3>
                {hasDiscount ? (
                  <div>
                    <p className="text-gray-600 line-through">
                      Original: ₱{originalPrice.toLocaleString()}
                    </p>
                    <p className="font-semibold text-emerald-600">
                      Discounted Price: ₱{finalPrice.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold text-emerald-600">
                    Total Price: ₱{finalPrice.toLocaleString()}
                  </p>
                )}

                {booking.paidAt && (
                  <p className="text-sm text-gray-600">
                    Paid At: {new Date(booking.paidAt).toLocaleString()}
                  </p>
                )}
                {booking.paidBy?.name && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-500" /> Paid By: {booking.paidBy.name} (
                    {booking.paidBy.email})
                  </p>
                )}

                {/* Receipt */}
                {booking.proofUrl && (
                  <div className="p-3 border rounded-lg bg-gray-50 shadow-sm text-center">
                    <p className="font-semibold text-sm mb-2 flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> Receipt
                    </p>
                    <div className="flex justify-center">
                      <Image
                        src={booking.proofUrl}
                        alt="Receipt Preview"
                        width={200}
                        height={140}
                        className="rounded-lg border object-contain cursor-pointer max-h-[180px] hover:shadow-md transition"
                        onClick={() => setShowFullReceipt(true)}
                      />
                    </div>
                    <p
                      className="text-xs text-blue-600 mt-1 hover:underline cursor-pointer"
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
                        <p className="text-sm text-gray-600">{booking.weather.temperature}°C</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition cursor-pointer"
              >
                Close
              </button>
              {canCancel && (
                <button
                  onClick={() => setShowCancellationModal(true)}
                  disabled={isCancelling}
                  className="flex-1 px-5 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel Trip
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Cancellation Modal */}
      {booking && (
        <CancellationModal
          isOpen={showCancellationModal}
          onClose={() => setShowCancellationModal(false)}
          onConfirm={handleCancellation}
          bookingTitle={
            booking.type === 'trip'
              ? booking.destination || 'Trip'
              : booking.type === 'itinerary'
                ? booking.title || 'Itinerary'
                : booking.promoTitle || 'Promo'
          }
          booking={booking}
          isLoading={isCancelling}
        />
      )}

      {/* Full Receipt Lightbox */}
      <Dialog
        open={showFullReceipt}
        onClose={() => setShowFullReceipt(false)}
        className="relative z-[60]"
      >
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowFullReceipt(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow hover:bg-gray-200 cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-700 cursor-pointer" />
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
