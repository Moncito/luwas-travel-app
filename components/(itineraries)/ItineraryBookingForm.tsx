'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { db } from '@/firebase/client'
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import type { User } from 'firebase/auth'

interface Props {
  slug: string
  user: User
}

export default function ItineraryBookingForm({ slug, user }: Props) {
  const router = useRouter()
  const [itinerary, setItinerary] = useState<any>(null)
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

  // ✅ Autofill from authenticated user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }))
    }
  }, [user])

  // ✅ Fetch itinerary by slug
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const q = query(collection(db, 'itineraries'), where('slug', '==', slug))
        const snapshot = await getDocs(q)
        if (snapshot.empty) {
          router.push('/404')
          return
        }
        const doc = snapshot.docs[0]
        setItinerary({ id: doc.id, ...doc.data() })
      } catch (err) {
        console.error('Error fetching itinerary:', err)
        toast.error('Failed to load itinerary.')
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchItinerary()
  }, [slug, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await addDoc(collection(db, 'itineraryBookings'), {
        ...formData,
        userId: user.uid,
        people: Number(formData.people),
        itineraryId: itinerary.id,
        slug,
        title: itinerary.title,
        status: 'upcoming',
        createdAt: serverTimestamp(),
      })

      toast.success('✅ Booking Confirmed!')
      router.push('/bookings/success?type=itinerary')
    } catch (err) {
      console.error('Booking failed:', err)
      toast.error('❌ Failed to submit booking.')
    }
  }

  const totalPrice =
    itinerary && formData.people ? itinerary.price * Number(formData.people) : 0

  if (loading || !itinerary) {
    return <h1 className="text-center text-xl mt-16">Loading itinerary...</h1>
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-white bg-cover bg-center">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-3xl p-10 max-w-xl w-full space-y-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-4">
          Let us Craft your Getaway
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-style"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-style"
          />
          <input
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="input-style"
          />
          <input
            name="address"
            placeholder="Local Address"
            value={formData.address}
            onChange={handleChange}
            className="input-style"
          />
          <input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input-style"
          />
          <input
            name="people"
            type="number"
            min="1"
            value={formData.people}
            onChange={handleChange}
            className="input-style"
          />
        </div>

        <input
          value={itinerary.title}
          readOnly
          className="w-full p-3 border rounded bg-gray-100 cursor-not-allowed"
        />

        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Special Requests (optional)"
          className="w-full p-3 border rounded"
        />

        <div className="flex justify-between items-center">
          <p className="font-medium text-blue-900">
            Total Price: <span className="font-bold">₱{totalPrice.toLocaleString()}</span>
          </p>
          <button
            type="submit"
            className="bg-blue-700 text-white px-6 py-3 rounded-full hover:bg-blue-800"
          >
            Book My Adventure
          </button>
        </div>

        <style jsx>{`
          .input-style {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            margin-top: 0.25rem;
          }

          .input-style:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }
        `}</style>
      </motion.form>
    </div>
  )
}
