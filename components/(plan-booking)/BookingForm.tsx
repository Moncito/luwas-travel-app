'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Image from 'next/image'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { useRouter } from 'next/navigation'
import type { User } from 'firebase/auth'
import {
  Mail,
  Phone,
  Calendar,
  Home,
  Users,
  User as UserIcon,
  MapPin,
} from 'lucide-react'

interface Props {
  destinationId: string
  user: User
  tripType?: 'fixed' | 'custom'
  packageId?: string | null
  customTotal?: number
  customTravelers?: number
  customActivities?: any[]
  customDates?: {
    startDate?: string
    endDate?: string
  }
}

interface Destination {
  name: string
  price: number
  latitude: number
  longitude: number
  imageUrl?: string
}

interface TripPackage {
  title: string
  price: number
  duration: string
  imageUrl?: string
}

function IconInput({ icon: Icon, name, type = 'text', ...props }: any) {
  return (
    <div className="relative w-full">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        {...props}
        name={name}
        type={type}
        maxLength={name === 'phone' ? 11 : undefined}
        pattern={name === 'phone' ? '[0-9]{11}' : undefined}
        inputMode={name === 'phone' ? 'numeric' : undefined}
        className="pl-10 pr-4 py-3 w-full rounded-md border border-gray-300 bg-white 
                   focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
      />
    </div>
  )
}

export default function BookingForm({
  destinationId,
  user,
  tripType = 'fixed',
  packageId,
  customTotal,
  customTravelers,
  customActivities,
  customDates,
}: Props) {
  const router = useRouter()
  const [destination, setDestination] = useState<Destination | null>(null)
  const [tripPackage, setTripPackage] = useState<TripPackage | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    localAddress: '',
    departureDate: '',
    returnDate: '',
    travelers: 1,
    specialRequests: '',
  })

  // 🧾 Prefill user info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.displayName || '',
        email: user.email || '',
      }))
    }
  }, [user])

  // 🧭 Prefill custom trip data
  useEffect(() => {
    if (tripType === 'custom' && customTravelers) {
      setFormData((prev) => ({
        ...prev,
        travelers: customTravelers,
        departureDate: customDates?.startDate || '',
        returnDate: customDates?.endDate || '',
      }))
    }
  }, [tripType, customTravelers, customDates])

  // ✅ Fetch data (destination or package)
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (tripType === 'custom') {
          const ref = doc(db, 'destinations', destinationId)
          const snap = await getDoc(ref)
          if (snap.exists()) setDestination(snap.data() as Destination)
          else toast.error('Destination not found.')
        } else if (tripType === 'fixed' && packageId) {
          const ref = doc(db, 'tripPackages', packageId)
          const snap = await getDoc(ref)
          if (snap.exists()) setTripPackage(snap.data() as TripPackage)
          else toast.error('Package not found.')
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch booking details.')
      }
    }
    fetchData()
  }, [destinationId, packageId, tripType])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'travelers' ? Number(value) : value,
    })
  }

  // ✈️ Submit booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const totalPrice =
        tripType === 'custom'
          ? customTotal || 0
          : (tripPackage?.price || 0) * formData.travelers

      const payload = {
        tripType,
        destinationId,
        tripPackageId: tripType === 'fixed' ? packageId : null,
        activities: tripType === 'custom' ? customActivities || [] : [],
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        userId: user.uid,
        travelers: formData.travelers,
        departureDate: formData.departureDate || customDates?.startDate || '',
        returnDate: formData.returnDate || customDates?.endDate || '',
        specialRequests: formData.specialRequests || '',
        type: tripType === 'custom' ? 'itinerary' : 'trip',
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create booking')

      toast.success('✅ Booking created successfully!')

      // Redirect
      router.push(`/destinations/${destinationId}/pay?bookingId=${data.id}&type=${tripType}&title=${encodeURIComponent(title || "Trip Booking")}`)
    } catch (err: any) {
      console.error('Booking error:', err)
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 🕒 Wait until correct data loads
  if (tripType === 'custom' && !destination) return null
  if (tripType === 'fixed' && !tripPackage) return null

  // 💰 Price computation
  const basePrice =
    tripType === 'custom'
      ? customTotal || destination?.price || 0
      : tripPackage?.price || 0

  const title =
    tripType === 'custom'
      ? destination?.name
      : tripPackage?.title

  const imageUrl =
    tripType === 'custom'
      ? destination?.imageUrl
      : tripPackage?.imageUrl

  const totalPrice =
    tripType === 'custom'
      ? customTotal || 0
      : formData.travelers * (tripPackage?.price || 0)

  const today = new Date().toISOString().split('T')[0]

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left: Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl border border-orange-100 space-y-6"
        >
          <h2 className="text-2xl font-extrabold text-blue-800">
            Book Your {tripType === 'custom' ? 'Custom Trip' : 'Package Adventure'}
          </h2>
          <p className="text-sm text-gray-600">
            Fill in your details to confirm your reservation
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IconInput icon={UserIcon} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required />
            <IconInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <IconInput icon={Phone} name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
            <IconInput icon={Home} name="localAddress" value={formData.localAddress} onChange={handleChange} placeholder="Local Address" required />
            <IconInput icon={Calendar} type="date" name="departureDate" value={formData.departureDate} min={today} onChange={handleChange} required />
            <IconInput icon={Calendar} type="date" name="returnDate" value={formData.returnDate} min={today} onChange={handleChange} />
            <IconInput icon={Users} type="number" min={1} name="travelers" value={formData.travelers} onChange={handleChange} placeholder="Travelers" required />
          </div>

          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Special Requests"
            rows={3}
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />

          {/* Price Summary */}
          <div className="bg-blue-50 text-blue-900 p-3 rounded-lg text-center">
            <p className="text-sm">
              Price per traveler:{' '}
              <strong>₱{(basePrice / (formData.travelers || 1)).toLocaleString()}</strong>
            </p>
            <p className="text-sm">
              Travelers: <strong>{formData.travelers}</strong>
            </p>
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-lg font-bold text-blue-900"
            >
              Total Price: ₱{totalPrice.toLocaleString()}
            </motion.p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-blue-700 text-white px-8 py-3 rounded-full font-bold hover:from-orange-600 hover:to-blue-800 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : tripType === 'custom' ? 'Proceed to Customize' : 'Book Package Now'}
          </button>

          <p className="text-xs text-gray-400 mt-2">
            {tripType === 'custom'
              ? 'You’ll customize your trip in the next step.'
              : 'You’ll pay via GCash on the next step.'}
          </p>
        </form>

        {/* Right: Preview */}
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={title || 'Destination'}
              width={800}
              height={400}
              className="w-full h-56 object-cover"
            />
          )}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-900">{title}</h3>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                {tripType === 'custom' ? 'Custom Trip' : 'Fixed Package'}
              </span>
            </div>

            <div className="space-y-1 text-gray-700">
              <p>
                Base Price: <span className="font-semibold">₱{basePrice.toLocaleString()}</span>
              </p>
              <p>
                Travelers: <span className="font-semibold">{formData.travelers}</span>
              </p>
              <motion.p
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-lg font-bold text-blue-900"
              >
                Total: ₱{totalPrice.toLocaleString()}
              </motion.p>
            </div>

            {tripType === 'custom' && destination && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50 flex items-center gap-3 text-sm text-blue-800">
                <MapPin className="w-5 h-5" />
                <span>
                  Coordinates: {destination.latitude}, {destination.longitude}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
