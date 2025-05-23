'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import ItineraryBookingForm from '@/components/(itineraries)/ItineraryBookingForm'

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

  if (checkingAuth || !user || !slug || typeof slug !== 'string') {
    return <p className="text-center py-20 text-lg">Loading itinerary booking...</p>
  }

  return <ItineraryBookingForm slug={slug} user={user} />
}
