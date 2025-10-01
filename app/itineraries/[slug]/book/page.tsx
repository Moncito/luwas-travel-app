'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import ItineraryBookingForm from '@/components/(itineraries)/ItineraryBookingForm'
import { Calendar } from 'lucide-react'
import Image from 'next/image'

export default function ItineraryBookingPage() {
  const router = useRouter()
  const { slug } = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/sign-in')
      } else {
        setUser(currentUser)
      }
      setCheckingAuth(false)
    })
    return () => unsubscribe()
  }, [router])

  if (checkingAuth || !slug || typeof slug !== 'string' || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-700 font-medium">Loading itinerary booking...</p>
        <p className="text-sm text-gray-500">Please wait a moment</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-20 px-6">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Image src="/logo.png" alt="Luwas Logo" width={40} height={40} className="rounded-md" />
          <span className="text-xl font-bold text-indigo-700">Luwas Travel</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-indigo-900">
          <Calendar size={24} className="text-indigo-600" />
          <h1 className="text-3xl md:text-4xl font-bold">Confirm Your Itinerary Booking</h1>
        </div>
        <p className="mt-4 text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
          "Plan smarter, travel smoother — book your itinerary with Luwas today."
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <ItineraryBookingForm slug={slug} user={user} />
      </div>
    </div>
  )
}
