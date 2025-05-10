'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { Booking } from '@/types/booking'
import EditBookingModal from '@/components/(admin)/EditBookingModal'
import BookingAnalyticsChart from '@/components/(admin)/BookingAnalyticsChart'

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setBookings(data)
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      setError(err.message)
      toast.error('Failed to fetch bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true
    return booking.status.toLowerCase() === filter
  })

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this booking?')
    if (!confirmed) return

    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      setBookings(bookings.filter((booking) => booking.id !== id))
      toast.success('Booking deleted!')
    } catch (err) {
      console.error('Error deleting booking:', err)
      toast.error('Error deleting booking.')
    }
  }

  // ✅ STEP A: Export to CSV function
  const handleExportToCSV = (): void => {
    const headers = ['Full Name', 'Destination', 'Departure Date', 'Status', 'Created At']
    const rows = filteredBookings.map((b) => [
      b.fullName,
      b.destination,
      b.departureDate,
      b.status,
      format(new Date(b.createdAt), 'yyyy-MM-dd'),
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((e) => e.map((v) => `"${v}"`).join(','))
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `bookings_${filter}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) return <p className="text-center text-gray-500">Loading Bookings...</p>
  if (error) return <p className="text-center text-red-500">{error}</p>

  return (
    <div className="p-8 space-y-10">
      <h1 className="text-2xl font-bold">All Bookings</h1>

      {/* Analytics Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <BookingAnalyticsChart />
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-wrap gap-4">
        {['all', 'upcoming', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            className={`px-4 py-2 rounded ${
              filter === f ? 'bg-black text-white' : 'bg-gray-200'
            }`}
            onClick={() => setFilter(f as any)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Export CSV Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExportToCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Export CSV
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-2">Full Name</th>
              <th className="text-left px-4 py-2">Destination</th>
              <th className="text-left px-4 py-2">Departure</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="border-t">
                <td className="px-4 py-2">{booking.fullName}</td>
                <td className="px-4 py-2">{booking.destination}</td>
                <td className="px-4 py-2">{booking.departureDate}</td>
                <td className="px-4 py-2 capitalize">{booking.status}</td>
                <td className="px-4 py-2">
                  {format(new Date(booking.createdAt), 'yyyy-MM-dd')}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => setEditingBooking(booking)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(booking.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onUpdated={() => {
            setEditingBooking(null)
            setLoading(true)
            fetchBookings()
          }}
        />
      )}
    </div>
  )
}
