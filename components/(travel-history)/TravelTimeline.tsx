'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, PlaneTakeoff, MapPin } from 'lucide-react'
import Image from 'next/image'
import { db } from '@/firebase/client'
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import BookingDetailModal from './BookingDetailModal'
import type { Booking } from '@/types/booking'


interface Props {
  userId: string
}


const FILTERS = ['upcoming', 'completed', 'cancelled'] as const
type TripStatus = typeof FILTERS[number]

const statusBadge = {
  upcoming: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-800',
  waiting_payment: 'bg-yellow-100 text-yellow-700',
}

export default function TravelTimeline({ userId }: Props) {
  const [filter, setFilter] = useState<TripStatus>('upcoming')
  const [trips, setTrips] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const bookingQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        )

        const itineraryQuery = query(
          collection(db, 'itineraryBookings'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        )

        const [bookingsSnap, itinerariesSnap] = await Promise.all([
          getDocs(bookingQuery),
          getDocs(itineraryQuery)
        ])

        const bookings = bookingsSnap.docs.map(doc => ({
          id: doc.id,
          type: 'trip',
          ...doc.data(),
        })) as Booking[]

        const itineraries = itinerariesSnap.docs.map(doc => ({
          id: doc.id,
          type: 'itinerary',
          ...doc.data(),
          status: doc.data().status || 'upcoming',
          createdAt: doc.data().createdAt || new Date(),
        })) as Booking[]

        const combined = [...bookings, ...itineraries].map(item => ({
          ...item,
          createdAt: typeof item.createdAt?.toDate === 'function'
            ? item.createdAt.toDate()
            : new Date(item.createdAt),
        })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        setTrips(combined)
      } catch (err) {
        console.error('❌ Failed to fetch trips:', err)
      }
    }

    fetchTrips()
  }, [userId])

  const filteredTrips = trips.filter(trip => trip.status === filter)

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden text-white py-16 px-6">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/vacation.png"
          alt="Travel History"
          fill
          priority
          className="object-cover brightness-75"
        />
      </div>
      <div className="absolute inset-0 bg-black/40 -z-10" />

      {/* Title */}
      <h2 className="text-5xl font-bold mb-10 text-white text-center">Your Travel History</h2>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {FILTERS.map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 font-semibold rounded-full transition-all ${
              filter === status
                ? 'bg-white text-black'
                : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {filteredTrips.length === 0 ? (
          <p className="col-span-full text-center text-white/70">
            No trips found for "{filter}"
          </p>
        ) : (
          filteredTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              onClick={() => setSelectedBooking(trip)}
              className="cursor-pointer flex flex-col bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-md transition duration-300 hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <PlaneTakeoff className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-bold text-white">
                    {trip.destination || trip.title}
                    {trip.type === 'itinerary' && (
                      <span className="text-xs text-white/50 ml-1">[Itinerary]</span>
                    )}
                  </h3>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusBadge[trip.status]}`}>
                  {trip.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-sm text-white/80 mb-2 line-clamp-3">
                {trip.specialRequests || 'No special requests.'}
              </p>

              <div className="text-sm text-white/70 flex items-center mb-1">
                <CalendarDays className="w-4 h-4 mr-2" />
                {trip.departureDate}
              </div>

              <div className="text-sm text-white/70 flex items-center mb-1">
                <MapPin className="w-4 h-4 mr-2" />
                {trip.location || 'Philippines'}
              </div>

              {trip.travelers && trip.price && (
                <div className="text-sm text-white/70">
                  👥 {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''} – ₱{(trip.travelers * trip.price).toLocaleString()}
                </div>
              )}

              {trip.proofUrl && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-white/80 mb-1">🧾 Receipt Uploaded</p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <BookingDetailModal
        isOpen={!!selectedBooking}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </section>
  )
}
