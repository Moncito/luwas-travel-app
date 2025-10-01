'use client'

import { useEffect, useState, useMemo } from 'react'
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

const statusConfig: Record<
  string,
  { color: string; icon: JSX.Element }
> = {
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

export default function TravelTimeline({ userId }: Props) {
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [trips, setTrips] = useState<TravelRecord[]>([])
  const [selectedBooking, setSelectedBooking] = useState<TravelRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    const fetchTrips = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/travel-history?userId=${encodeURIComponent(userId)}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: TravelRecord[] = await res.json()
        if (!cancelled) setTrips(data)
      } catch (err: any) {
        if (!cancelled) setError(err.message || 'Failed to load history')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchTrips()
    return () => { cancelled = true }
  }, [userId])

  // normalize statuses for filtering
  const isUpcomingish = (status?: string) => {
    if (!status) return false
    const s = status.toLowerCase()
    return ['upcoming', 'pending_payment', 'waiting_payment', 'paid', 'awaiting_approval'].includes(s)
  }

  const filteredTrips = useMemo(() => {
    if (filter === 'upcoming') {
      return trips.filter(t => isUpcomingish(t.status))
    }
    return trips.filter(t => t.status?.toLowerCase() === filter)
  }, [trips, filter])

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

      <h2 className="text-5xl font-bold mb-10 text-white text-center flex items-center gap-2">
        Your Travel History <PlaneTakeoff className="w-8 h-8 text-blue-300" />
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {['upcoming', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status as typeof filter)}
            className={`px-6 py-2 font-semibold rounded-full transition-all ${
              filter === status ? 'bg-white text-black shadow-md' : 'bg-white/30 text-white hover:bg-white/50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading/Error */}
      {loading && <p className="text-white/80 mb-6">Loading your trips...</p>}
      {error && <p className="text-red-300 mb-6">{error}</p>}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {!loading && filteredTrips.length === 0 ? (
          <p className="col-span-full text-center text-white/70">No records found for “{filter}”.</p>
        ) : (
          filteredTrips.map((trip, i) => {
            const badgeStyle = statusConfig[trip.status?.toLowerCase()]?.color || 'bg-gray-200 text-gray-800'
            const badgeIcon = statusConfig[trip.status?.toLowerCase()]?.icon

            return (
              <motion.div
                key={trip.id}
                onClick={() => setSelectedBooking(trip)}
                className="cursor-pointer flex flex-col bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-md transition duration-300 hover:scale-105"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {/* Title + Status */}
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-white line-clamp-1">{trip.destination}</h3>
                  {trip.status && (
                    <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${badgeStyle}`}>
                      {badgeIcon}
                      {trip.status.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Traveler */}
                <p className="flex items-center gap-2 text-sm text-white/90 font-medium mb-2">
                  <UserIcon className="w-4 h-4" /> {trip.fullName}
                </p>

                {/* Description */}
                <p className="text-sm text-white/80 mb-3 line-clamp-3">
                  {trip.specialRequests || (trip.type === 'promo' ? 'Promo booking' : 'No special requests')}
                </p>

                {/* Date */}
                {trip.departureDate && (
                  <div className="text-sm text-white/70 flex items-center mb-1">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {trip.departureDate}
                  </div>
                )}

                {/* Location */}
                <div className="text-sm text-white/70 flex items-center mb-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  {trip.location || 'Philippines'}
                </div>

                {/* Price */}
                <div className="text-sm text-white/70">
                  👥 {trip.people} traveler(s) – ₱{trip.totalPrice.toLocaleString()}
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
      />
    </section>
  )
}
