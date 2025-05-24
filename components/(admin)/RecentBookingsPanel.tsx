'use client'

import { useEffect, useState } from 'react'
import { db } from '@/firebase/client'
import {
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore'

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

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const tripQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'))
        const itinQuery = query(collection(db, 'itineraryBookings'), orderBy('createdAt', 'desc'))

        const [tripSnap, itinSnap] = await Promise.all([
          getDocs(tripQuery),
          getDocs(itinQuery),
        ])

        const tripResults: Booking[] = tripSnap.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            fullName: data.fullName,
            destination: data.destination,
            status: data.status || 'upcoming',
            createdAt: typeof data.createdAt?.toDate === 'function'
              ? data.createdAt.toDate()
              : new Date(data.createdAt),
            type: 'trip',
          }
        })

      const itinResults: Booking[] = itinSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          fullName: data.fullName || data.name || '[unknown]',
          destination: data.destination || data.title || '[itinerary]',
          status: data.status || 'upcoming',
          createdAt: typeof data.createdAt?.toDate === 'function'
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
          type: 'itinerary',
        };
      });


        const combined = [...tripResults, ...itinResults]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)

        setBookings(combined)
      } catch (err) {
        console.error('🔥 Failed to fetch recent bookings:', err)
      }
    }

    fetchRecent()
  }, [])

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
      {bookings.length === 0 ? (
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
