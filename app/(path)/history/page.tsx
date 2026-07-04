'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { Player } from '@lottiefiles/react-lottie-player' // Import Lottie player
import loginReminder from '@/app/components/lottie/login-reminder.json' //  Import the JSON as data
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
      setUser(currentUser)
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
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-blue-500 via-teal-400 to-cyan-300 text-center text-white"
>
          {/* ✅ Lottie Animation */}
          <Player
            autoplay
            loop
            src={loginReminder} // ✅ Use the imported JSON
            className="w-64 h-64 mb-6"
          />

          <h2 className="text-3xl font-semibold text-gray-800 mb-2">You are not logged in</h2>

          <p className="text-gray-600 text-lg max-w-md mb-6">
            Please create an account or log in to view your personalized travel history.
          </p>

          <button
            onClick={() => router.push('/sign-up')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition cursor-pointer"
          >
            Log In
          </button>
        </div>
      )}
      <Footer />
    </div>
  )
}
