'use client'

import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'

interface Props {
  isOpen: boolean
  onClose: () => void
  booking: {
    id: string
    fullName: string
    email: string
    phone: string
    destination: string
    departureDate: string
    status: string
    proofUrl?: string
  }
  onStatusChange: (id: string, newStatus: string) => void
}

export default function BookingDetailsModal({ isOpen, onClose, booking, onStatusChange }: Props) {
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Failed to update status')

      toast.success(`Booking marked as ${newStatus}`)
      onStatusChange(booking.id, newStatus)
      onClose()
    } catch (err) {
      toast.error('Failed to update status')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-fade-in-up border border-gray-200">
          <Dialog.Title className="text-2xl font-bold text-blue-800 mb-4">Booking Information</Dialog.Title>

          <div className="space-y-3 text-sm text-gray-800">
            <div><strong>Name:</strong> {booking.fullName}</div>
            <div><strong>Email:</strong> {booking.email}</div>
            <div><strong>Phone:</strong> {booking.phone}</div>
            <div><strong>Destination:</strong> {booking.destination}</div>
            <div><strong>Departure Date:</strong> {booking.departureDate}</div>
            <div><strong>Status:</strong> <span className="capitalize font-semibold text-blue-700">{booking.status}</span></div>
          </div>

          {booking.proofUrl && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">🧾 Uploaded Receipt:</p>
              <a href={booking.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                <Image
                  src={booking.proofUrl}
                  alt="Receipt"
                  width={400}
                  height={300}
                  className="rounded-lg border hover:shadow-lg transition"
                />
              </a>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8">
            {booking.status !== 'paid' && (
              <button
                onClick={() => handleStatusUpdate('paid')}
                disabled={loading}
                className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition"
              >
                {loading ? 'Approving...' : '✅ Approve'}
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={loading}
                className="bg-red-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition"
              >
                {loading ? 'Cancelling...' : '🗑 Cancel'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
