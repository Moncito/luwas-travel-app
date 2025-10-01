'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from '@/firebase/client'
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
  slug: string
  user: User
}

interface Itinerary {
  id: string
  title: string
  slug: string
  price: number
  latitude: number
  longitude: number
  imageUrl?: string
}

function IconInput({ icon: Icon, ...props }: any) {
  return (
    <div className="relative w-full">
      <Icon className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" size={18} />
      <input
        {...props}
        className="pl-10 pr-4 py-3 w-full rounded-md border border-gray-300 bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
      />
    </div>
  )
}

export default function ItineraryBookingForm({ slug, user }: Props) {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    people: '1',
    notes: '',
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }))
    }
  }, [user])

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const q = query(collection(db, 'itineraries'), where('slug', '==', slug))
        const snapshot = await getDocs(q)
        if (snapshot.empty) {
          toast.error('Itinerary not found.')
          return
        }
        const doc = snapshot.docs[0]
        setItinerary({ id: doc.id, ...doc.data() } as Itinerary)
      } catch (err) {
        console.error('Error loading itinerary:', err)
        toast.error('Failed to load itinerary.')
      } finally {
        setLoading(false)
      }
    }

    fetchItinerary()
  }, [slug])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itinerary) return

    const totalPrice = itinerary.price * Number(formData.people)
    setLoading(true)

    try {
      const res = await fetch('/api/itinerary-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user.uid,
          itineraryId: itinerary.id,
          slug: itinerary.slug,
          title: itinerary.title,
          totalPrice,
          status: 'pending',
        }),
      })

      if (!res.ok) throw new Error('Failed to create itinerary booking')
      const data = await res.json()

      toast.success('Booking created! Redirecting to payment...')

      // ✅ Redirect to Pay Page
      window.location.href = `/itineraries/${slug}/pay?bookingId=${data.id}&title=${encodeURIComponent(itinerary.title)}`
    } catch (err) {
      console.error('Booking error:', err)
      toast.error('❌ Booking submission failed.')
      setLoading(false)
    }
  }

  if (loading || !itinerary) {
    return <p className="text-center text-lg mt-20">Loading itinerary details...</p>
  }

  const totalPrice = itinerary.price * Number(formData.people)

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-orange-50 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Left: Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl border border-orange-100 space-y-6">
          <h2 className="text-2xl font-extrabold text-blue-800">Reserve This Journey</h2>
          <p className="text-sm text-gray-600">Fill in your details to confirm your reservation</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IconInput icon={UserIcon} name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
            <IconInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required />
            <IconInput icon={Phone} name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
            <IconInput icon={Home} name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
            <IconInput icon={Calendar} type="date" name="date" value={formData.date} min={new Date().toISOString().split('T')[0]} onChange={handleChange} required />
            <IconInput icon={Users} type="number" min={1} name="people" value={formData.people} onChange={handleChange} placeholder="Travelers" required />
          </div>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Special requests or notes"
            rows={3}
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />

          <div className="text-center">
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-blue-600 text-white px-8 py-3 rounded-full font-bold hover:from-orange-600 hover:to-blue-700 transition disabled:opacity-50">
              {loading ? 'Processing...' : 'Book Itinerary Now'}
            </button>
            <p className="text-xs text-gray-400 mt-2">You’ll pay via GCash on the next step</p>
          </div>
        </form>

        {/* Right: Itinerary Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden">
          {itinerary.imageUrl && (
            <img src={itinerary.imageUrl} alt={itinerary.title} className="w-full h-72 object-cover" />
          )}
          <div className="p-6 space-y-4">
            <p>Price per person: <span className="font-semibold">₱{itinerary.price.toLocaleString()}</span></p>
            <p>Travelers: <span className="font-semibold">{formData.people}</span></p>
            <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.4 }} className="text-lg font-bold bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
              Total Price: ₱{totalPrice.toLocaleString()}
            </motion.p>
            <div className="mt-4 p-3 rounded-lg bg-orange-50 flex items-center gap-3 text-sm text-orange-800">
              <MapPin className="w-5 h-5" />
              <span>Coordinates: {itinerary.latitude}, {itinerary.longitude}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
