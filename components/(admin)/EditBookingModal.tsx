// components/(admin)/EditBookingModal.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Booking } from '@/app/admin/types'

interface Props {
  booking: Booking
  onClose: () => void
  onUpdated: () => void
}

export default function EditBookingModal({ booking, onClose, onUpdated }: Props) {
  const [status, setStatus] = useState(booking.status)
  const [updating, setUpdating] = useState(false)

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        throw new Error('Failed to update booking.')
      }

      toast.success('Booking updated!')
      onUpdated()
      onClose()
    } catch (err) {
      toast.error('Error updating booking.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80 space-y-4">
        <h2 className="text-lg font-bold">Edit Booking Status</h2>
        <select
          className="w-full border rounded p-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {['upcoming', 'completed', 'cancelled'].map((option) => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Cancel</button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
