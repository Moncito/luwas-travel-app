'use client'

import { format } from 'date-fns'
import { Eye, Trash, Mail } from 'lucide-react'
import { PromoBooking } from '@/types/promoBooking'
import BookingDetailsModal from './BookingDetailsModal'
import ConfirmActionModal from './ConfirmActionModal'
import { useState } from 'react'

interface Props {
  bookings: PromoBooking[]
  onDelete: (id: string) => void
  onSendReceipt: (id: string) => void
  onUpdateStatus: (id: string, status: string) => void
}

export default function PromoBookingsTable({
  bookings,
  onDelete,
  onSendReceipt,
  onUpdateStatus,
}: Props) {
  const [selected, setSelected] = useState<PromoBooking | null>(null)
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
      <h2 className="text-xl font-semibold text-red-700 mb-4">Promo Bookings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Promo</th>
              <th className="px-6 py-3">Travelers</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-6 py-3">{b.fullName}</td>
                <td className="px-6 py-3">{b.email}</td>
                <td className="px-6 py-3">{b.promoTitle}</td>
                <td className="px-6 py-3">{b.travelers}</td>
                <td className="px-6 py-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    {b.status ?? 'upcoming'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {b.createdAt
                    ? format(new Date(b.createdAt), 'MMM dd, yyyy')
                    : 'N/A'}
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

      {selected && (
      <BookingDetailsModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        booking={{
          id: selected.id,
          fullName: selected.fullName,
          email: selected.email,
          phone: selected.phone ?? '',
          destination: selected.promoTitle,
          departureDate: selected.departureDate,
          status: selected.status ?? 'upcoming',
          proofUrl: selected.proofUrl,
          weather: selected.weather,
          price: selected.finalPrice ?? selected.price ?? 0, // ✅ Added this line
        }}
        onStatusChange={onUpdateStatus}
        type="promo"
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
