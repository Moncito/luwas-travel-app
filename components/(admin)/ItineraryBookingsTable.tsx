'use client'

import { format } from 'date-fns'
import { Eye, Pencil, Trash, Mail } from 'lucide-react'
import { ItineraryBooking } from '@/types/itineraryBooking'
import EditItineraryBookingModal from './EditItineraryBookingModal'
import BookingDetailsModal from './BookingDetailsModal'
import ConfirmActionModal from './ConfirmActionModal'
import { useState } from 'react'

interface Props {
  bookings: ItineraryBooking[]
  onDelete: (id: string) => void
  onSendReceipt: (id: string) => void
  onUpdateStatus: (id: string, status: string) => void
}

export default function ItineraryBookingsTable({
  bookings,
  onDelete,
  onSendReceipt,
  onUpdateStatus,
}: Props) {
  const [editing, setEditing] = useState<ItineraryBooking | null>(null)
  const [selected, setSelected] = useState<ItineraryBooking | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmType, setConfirmType] = useState<'delete' | 'send' | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleConfirm = () => {
    if (!selectedId || !confirmType) return
    if (confirmType === 'delete') onDelete(selectedId)
    if (confirmType === 'send') onSendReceipt(selectedId)
    setConfirmOpen(false)
    setConfirmType(null)
    setSelectedId(null)
  }

  return (
    <section className="bg-white p-4 rounded-lg shadow-md mt-10">
      <h2 className="text-xl font-semibold text-violet-800 mb-4">
        Itinerary Bookings
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Departure</th>
              <th className="px-6 py-3">People</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-6 py-3">{b.name}</td>
                <td className="px-6 py-3">{b.email}</td>
                <td className="px-6 py-3">{b.date}</td>
                <td className="px-6 py-3">{b.people ?? 1}</td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800">
                    {b.status ?? 'upcoming'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {b.createdAt ? format(new Date(b.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </td>
                <td className="px-6 py-3 flex gap-3">
                  <button
                    title="View"
                    onClick={() => setSelected(b)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    title="Edit"
                    onClick={() => setEditing(b)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => {
                      setConfirmType('delete')
                      setSelectedId(b.id)
                      setConfirmOpen(true)
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash className="w-5 h-5" />
                  </button>
                  <button
                    title="Send Receipt"
                    onClick={() => {
                      setConfirmType('send')
                      setSelectedId(b.id)
                      setConfirmOpen(true)
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditItineraryBookingModal
          booking={editing}
          onClose={() => setEditing(null)}
          onUpdated={() =>
            onUpdateStatus(editing.id, editing.status ?? 'upcoming')
          }
        />
      )}

      {selected && (
        <BookingDetailsModal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          booking={{
            id: selected.id,
            fullName: selected.name,
            email: selected.email,
            phone: selected.phone ?? '',
            destination: selected.slug?.replace(/-/g, ' ') ?? 'Untitled',
            departureDate: selected.date,
            status: selected.status ?? 'upcoming',
            proofUrl: selected.proofUrl,
            weather: selected.weather,
          }}
          onStatusChange={onUpdateStatus}
          type="itinerary"
        />
      )}

      <ConfirmActionModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        action={confirmType || 'delete'}
        loading={false}
      />
    </section>
  )
}
