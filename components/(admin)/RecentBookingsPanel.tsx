'use client'

import { useEffect, useState } from 'react'
import { Calendar, MapPin, User, Tag } from 'lucide-react'

interface Booking {
  id: string
  fullName: string
  destination: string
  status: string
  createdAt: string | { seconds: number }
  type: 'trip' | 'itinerary' | 'promo'
}

function formatDate(dateInput: Booking['createdAt']) {
  let date: Date
  if (typeof dateInput === 'string') {
    date = new Date(dateInput)
  } else if (typeof dateInput === 'object' && 'seconds' in dateInput) {
    date = new Date(dateInput.seconds * 1000)
  } else {
    return 'N/A'
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusStyle(status: string) {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-700 border border-blue-200'
    case 'completed':
      return 'bg-green-100 text-green-700 border border-green-200'
    case 'cancelled':
      return 'bg-red-100 text-red-700 border border-red-200'
    case 'awaiting_approval':
    case 'waiting_payment':
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

function typeLabel(type: Booking['type']) {
  switch (type) {
    case 'trip':
      return 'Trip'
    case 'itinerary':
      return 'Itinerary'
    case 'promo':
      return 'Promo'
    default:
      return 'Booking'
  }
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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-500" />
        Recent Bookings
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="w-1/3 h-3 bg-gray-200 rounded" />
                <div className="w-1/4 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          No recent bookings found.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="py-4 flex items-center justify-between hover:bg-gray-50 transition rounded-lg px-2"
            >
              {/* Left section */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  {b.type === 'promo' ? (
                    <Tag className="w-5 h-5 text-orange-500" />
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                    {b.fullName}
                    <span className="ml-2 text-xs text-gray-500">
                      [{typeLabel(b.type)}]
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {b.destination}
                  </p>
                </div>
              </div>

              {/* Right section */}
              <div className="flex flex-col items-end">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${statusStyle(
                    b.status
                  )}`}
                >
                  {b.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  {formatDate(b.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
