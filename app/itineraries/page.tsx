'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/client' // make sure this points to your Firebase **client SDK**
import ItineraryCard from '@/components/(itineraries)/ItineraryCard'
import Footer from '@/components/Footer'

interface Itinerary {
  id: string
  slug: string
  title: string
  image: string
  duration: string
  highlights: string[]
  price: number
}

export default function ItinerariesPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'itineraries'))
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          slug: doc.data().slug,
          title: doc.data().title,
          image: doc.data().image,
          duration: doc.data().duration || 'Flexible Duration',
          highlights: doc.data().highlights || [],
          price: doc.data().price || 0,
        }))
        setItineraries(data)
      } catch (err) {
        console.error('🔥 Error fetching itineraries:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchItineraries()
  }, [])

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Discover Pre-Planned Adventures Across the Philippines
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Browse our selection of fully-planned itineraries—from island escapes to cultural journeys. No stress, just pack and go.
        </p>
      </section>

      {loading ? (
        <p className="text-center text-gray-500">Loading itineraries...</p>
      ) : itineraries.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {itineraries.map(trip => (
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
      ) : (
        <div className="text-center mt-20 text-gray-500">
          <p className="text-xl">🚫 No itineraries available at the moment.</p>
          <p className="mt-2 text-sm">Please check back later or contact our travel team for help.</p>
        </div>
      )}

      <Footer />
    </main>
  )
}
