'use client'

import { useEffect, useState } from 'react'

interface Booking {
  id: string
  fullName: string
  destination: string
  status: string
  createdAt: Date
  type: 'trip' | 'itinerary'
}

export default function RecentBookingsPanel() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/admin/recent-bookings')
        const json = await res.json()
        setBookings(json)
      } catch (err) {
        console.error('🔥 Error loading recent bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecent()
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500 text-sm">No bookings found.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="py-3 flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {b.fullName}
                  <span className="text-xs text-gray-500 ml-2">[{b.type}]</span>
                </p>
                <p className="text-xs text-gray-500">{b.destination}</p>
              </div>
              <span
                className={`mt-2 md:mt-0 text-xs px-3 py-1 rounded-full font-medium ${
                  b.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-800'
                    : b.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : b.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {b.status?.replace('_', ' ') || 'unknown'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
