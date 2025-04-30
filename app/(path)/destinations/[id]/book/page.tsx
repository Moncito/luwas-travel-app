'use client'

import BookingForm from '@/components/(plan-booking)/BookingForm'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function BookingPage() {
  const { id } = useParams()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/user')
        const data = await res.json()
        if (data.user) {
          setIsAuthenticated(true)
        } else {
          toast.error('Please sign in first.')
          router.push('/sign-in')
        }
      } catch (err) {
        toast.error('Error verifying user.')
        router.push('/sign-in')
      }
    }

    checkUser()
  }, [router])

  if (isAuthenticated === null) return null // loading state

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-6">
      <BookingForm prefillDestination={id as string} />
    </div>
  )
}
