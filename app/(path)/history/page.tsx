'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TravelTimeline from '@/components/(travel-history)/TravelTimeline'

export default function TravelHistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null)
      } else {
        setUser(currentUser)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) {
    return <p className="text-center py-24 text-lg">Loading your travel history...</p>
  }

  return (
    <div>
      <Navbar />
      {user ? (
        <TravelTimeline userId={user.uid} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">You are not logged in</h2>
          <p className="text-gray-600 mb-6">
            Please create an account or log in to view your travel history.
          </p>
          <button
            onClick={() => router.push('/log-in')}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            Log In
          </button>
        </div>
      )}
      <Footer />
    </div>
  )
}
