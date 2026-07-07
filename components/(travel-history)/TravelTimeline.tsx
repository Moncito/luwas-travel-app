'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, PlaneTakeoff, MapPin, User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import BookingDetailModal from './BookingDetailModal'

type TravelRecord = {
  id: string
  type: 'trip' | 'itinerary' | 'promo'
  fullName: string
  email: string
  userId?: string | null

  destination: string
  people: number
  status: string
  createdAt: string
  departureDate?: string | null
  totalPrice: number

  paidAt?: string | null
  proofUrl?: string | null
  paidBy?: { uid?: string; email?: string; name?: string } | null

  specialRequests?: string
  location?: string
  weather?: {
    condition?: string
    temperature?: number
    icon?: string
  } | null
  discountPercentage?: number | null
  finalPrice?: number | null
}

const statusConfig: Record<string, { color: string; icon: JSX.Element }> = {
  upcoming: { color: 'bg-blue-100 text-blue-800', icon: <PlaneTakeoff className="w-4 h-4" /> },
  completed: { color: 'bg-green-100 text-green-800', icon: <span>✅</span> },
  cancelled: { color: 'bg-red-100 text-red-700', icon: <span>❌</span> },
  paid: { color: 'bg-emerald-100 text-emerald-800', icon: <span>💳</span> },
  pending_payment: { color: 'bg-yellow-100 text-yellow-700', icon: <span>⏳</span> },
  waiting_payment: { color: 'bg-yellow-100 text-yellow-700', icon: <span>⏳</span> },
  awaiting_approval: { color: 'bg-purple-100 text-purple-700', icon: <span>🕓</span> },
}

interface Props {
  userId: string
}

function safeLower(s?: string | null) {
  return (s || '').toLowerCase()
}

function formatPeso(n?: number | null) {
  const v = Number.isFinite(Number(n)) ? Number(n) : 0
  return v.toLocaleString()
}

export default function TravelTimeline({ userId }: Props) {
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [trips, setTrips] = useState<TravelRecord[]>([])
  const [selectedBooking, setSelectedBooking] = useState<TravelRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrips = async () => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/travel-history?userId=${encodeURIComponent(userId)}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: TravelRecord[] = await res.json()
      if (!cancelled) setTrips(data)
    } catch (err: any) {
      if (!cancelled) setError(err.message || 'Failed to load history')
    } finally {
      if (!cancelled) setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [userId])

  const handleBookingUpdated = () => {
    fetchTrips()
    setSelectedBooking(null)
  }

  // merge upcoming-like statuses
  const isUpcomingish = (status?: string) => {
    const s = safeLower(status)
    return ['upcoming', 'pending_payment', 'waiting_payment', 'paid', 'awaiting_approval'].includes(s)
  }

  const filteredTrips = useMemo(() => {
    if (filter === 'upcoming') return trips.filter(t => isUpcomingish(t.status))
    return trips.filter(t => safeLower(t.status) === filter)
  }, [trips, filter])

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-hidden text-white py-20 px-6">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/vacation.png"
          alt="Travel History"
          fill
          priority
          className="object-cover brightness-50"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 -z-10" />

      {/* Header Section */}
      <div className="text-center mb-16 max-w-2xl">
        <h2 className="text-6xl md:text-7xl font-bold mb-4 text-white text-center flex items-center justify-center gap-3">
          <span>Your Travel</span>
          <span className="text-blue-400">History</span>
          <PlaneTakeoff className="w-10 h-10 md:w-12 md:h-12 text-blue-400 animate-bounce" />
        </h2>
        <p className="text-lg text-white/70">Track all your bookings, trips, and travel memories in one place</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-14 max-w-2xl">
        {(['upcoming', 'completed', 'cancelled'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-3 font-semibold rounded-full transition-all duration-300 ${
              filter === status 
                ? 'bg-white text-blue-600 shadow-lg scale-105' 
                : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
            }`}
          >
            {status === 'upcoming' && '✈️ Upcoming'}
            {status === 'completed' && '✅ Completed'}
            {status === 'cancelled' && '❌ Cancelled'}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/80 text-lg">Loading your trips...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="w-full max-w-6xl mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {!loading && filteredTrips.length === 0 ? (
          <div className="col-span-full text-center py-20">
            <p className="text-5xl mb-4">🏝️</p>
            <p className="text-xl text-white/70">No {filter} trips found</p>
            <p className="text-sm text-white/50 mt-2">
              {filter === 'upcoming' && 'Book your next adventure to get started!'}
              {filter === 'completed' && 'Your completed trips will appear here'}
              {filter === 'cancelled' && 'No cancelled trips'}
            </p>
          </div>
        ) : (
          filteredTrips.map((trip, i) => {
            const s = safeLower(trip.status)
            const badgeStyle = statusConfig[s]?.color || 'bg-gray-200 text-gray-800'
            const badgeIcon = statusConfig[s]?.icon

            const displayPrice =
              trip.type === 'promo'
                ? trip.finalPrice ?? trip.totalPrice
                : trip.totalPrice

            return (
              <motion.div
                key={trip.id}
                onClick={() => setSelectedBooking(trip)}
                className="group cursor-pointer flex flex-col h-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/40 hover:scale-105 hover:from-white/25 hover:to-white/10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Status Badge */}
                {trip.status && (
                  <div className="flex justify-end mb-3">
                    <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${badgeStyle} shadow-md`}>
                      {badgeIcon}
                      {trip.status.replace('_', ' ')}
                    </span>
                  </div>
                )}

                {/* Destination Title */}
                <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition">
                  {trip.destination || (trip.type === 'promo' ? 'Promo Booking' : 'Booking')}
                </h3>

                {/* Traveler */}
                <p className="flex items-center gap-2 text-sm text-white/80 mb-4 font-medium">
                  <UserIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{trip.fullName}</span>
                </p>

                {/* Divider */}
                <div className="h-px bg-white/10 mb-4" />

                {/* Description */}
                {trip.specialRequests && (
                  <p className="text-sm text-white/70 mb-4 line-clamp-2">
                    📝 {trip.specialRequests}
                  </p>
                )}

                {/* Details - Flex grow */}
                <div className="flex-grow space-y-2 mb-4">
                  {trip.departureDate && (
                    <div className="text-sm text-white/75 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 flex-shrink-0 text-blue-300" />
                      <span>{trip.departureDate}</span>
                    </div>
                  )}

                  {trip.location && (
                    <div className="text-sm text-white/75 flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0 text-blue-300" />
                      <span>{trip.location}</span>
                    </div>
                  )}

                  <div className="text-sm text-white/75">
                    👥 {trip.people ?? 1} traveler{trip.people !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Price - Always at bottom */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-2xl font-bold text-emerald-300">
                    ₱{formatPeso(displayPrice)}
                  </p>
                  <p className="text-xs text-white/60 mt-1">Total price</p>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      <BookingDetailModal
        isOpen={!!selectedBooking}
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onBookingUpdated={handleBookingUpdated}
      />
    </section>
  )
}
