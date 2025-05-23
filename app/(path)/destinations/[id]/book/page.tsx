'use client'

import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter, useParams } from 'next/navigation'
import BookingForm from '@/components/(plan-booking)/BookingForm'

export default function BookingPage() {
  const router = useRouter()
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const auth = getAuth()
    onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/sign-in')
      } else {
        setUser(currentUser)
      }
    })
  }, [router])

  if (!id || typeof id !== 'string' || !user) return null

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-6">
      <BookingForm destinationId={id} user={user} />
    </div>
  )
}
