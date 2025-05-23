'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import ItineraryCard from './ItineraryCard'

// Define the shape of an itinerary
type Itinerary = {
  id: string
  title: string
  slug: string
  image: string
  duration: string
  description?: string
  price: number
  highlights: string[]
}

export default function ItinerariesList() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'itineraries'))
        const data: Itinerary[] = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().title,
          slug: doc.data().slug,
          image: doc.data().image,
          duration: doc.data().duration || 'Flexible Duration',
          description: doc.data().description || '',
          price: doc.data().price || 0,
          highlights: doc.data().highlights || [],
        }))
        setItineraries(data)
      } catch (err) {
        console.error('❌ Failed to fetch itineraries:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchItineraries()
  }, [])

  if (loading) return <p className="text-center text-gray-400">Loading itineraries...</p>

  if (itineraries.length === 0) {
    return (
      <div className="text-center mt-20 text-gray-500">
        <p className="text-xl">🚫 No itineraries available at the moment.</p>
        <p className="mt-2 text-sm">Please check back later or contact our travel team for help.</p>
      </div>
    )
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {itineraries.map((trip) => (
        <ItineraryCard
          key={trip.id}
          slug={trip.slug}
          title={trip.title}
          imageUrl={trip.image}
          duration={trip.duration}
          highlights={trip.highlights}
          price={trip.price}
        />
      ))}
    </section>
  )
}
