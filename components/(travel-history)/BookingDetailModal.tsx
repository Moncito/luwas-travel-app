'use client'

import { Dialog } from '@headlessui/react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Booking {
  id: string
  fullName: string
  email: string
  phone: string
  destination: string
  departureDate: string
  createdAt: string
  status: string
  proofUrl?: string
  specialRequests?: string
  location?: string
  travelers?: number
  price?: number
}

interface Props {
  isOpen: boolean
  onClose: () => void
  booking: Booking | null
}

export default function BookingDetailModal({ isOpen, onClose, booking }: Props) {
  if (!booking) return null

  const totalPrice = booking.travelers && booking.price
    ? booking.travelers * booking.price
    : null

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
          <Dialog.Title className="text-xl font-bold mb-4">
            {booking.destination} – Booking Details
          </Dialog.Title>

          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Full Name:</strong> {booking.fullName}</p>
            <p><strong>Email:</strong> {booking.email}</p>
            <p><strong>Phone:</strong> {booking.phone}</p>
            <p><strong>Location:</strong> {booking.location || 'Philippines'}</p>
            <p><strong>Departure:</strong> {booking.departureDate}</p>
            <p><strong>Status:</strong> <span className="capitalize">{booking.status}</span></p>
            <p><strong>Special Requests:</strong> {booking.specialRequests || 'None'}</p>
            {booking.travelers && <p><strong>Travelers:</strong> {booking.travelers}</p>}
            {totalPrice && <p><strong>Total Price:</strong> ₱{totalPrice.toLocaleString()}</p>}
          </div>

          {booking.proofUrl && (
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Receipt Preview:</p>
              <a href={booking.proofUrl} target="_blank" rel="noopener noreferrer">
                <Image
                  src={booking.proofUrl}
                  alt="Receipt"
                  width={500}
                  height={300}
                  className="rounded-lg border border-gray-300"
                />
              </a>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
