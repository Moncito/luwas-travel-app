'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/client'
import DestinationCard from '@/components/(admin)/DestinationCard'
import AddIteneraryCard from '@/components/(admin-itineraries)/AddItineraryCard'
import { toast } from 'sonner'

// ✅ Add interfaces
interface Destination {
  id: string
  name: string
  location: string
  description: string
  imageUrl: string
  price: number
  tags?: string[]
}

interface Itinerary {
  id: string
  title: string
  duration: string
  image: string
  price: number
}

export default function AdminTripsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [itineraries, setItineraries] = useState<Itinerary[]>([])

  // Fetch destinations and itineraries
  useEffect(() => {
    const fetchData = async () => {
      const destSnapshot = await getDocs(collection(db, 'destinations'))
      const destData = destSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Destination, 'id'>)
      }))
      setDestinations(destData)

      const itinerarySnapshot = await getDocs(collection(db, 'itineraries'))
      const itineraryData = itinerarySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Itinerary, 'id'>)
      }))
      setItineraries(itineraryData)
    }

    fetchData()
  }, [])

  // Delete functions
  const handleDeleteTrip = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'destinations', id))
      setDestinations(prev => prev.filter(d => d.id !== id))
      toast.success('Trip deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete trip')
    }
  }

  const handleDeleteItinerary = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'itineraries', id))
      setItineraries(prev => prev.filter(i => i.id !== id))
      toast.success('Itinerary deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete itinerary')
    }
  }

  return (
    <section className="p-6 space-y-16">
      {/* Trips Section */}
      <div>
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Trips / Bookings</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map(dest => (
            <DestinationCard key={dest.id} destination={dest} onDelete={handleDeleteTrip} />
          ))}
        </div>
      </div>

      {/* Itineraries Section */}
      <div>
        <h1 className="text-2xl font-bold text-green-700 mb-6">Itineraries</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map(itinerary => (
            <AddIteneraryCard
              key={itinerary.id}
              itinerary={itinerary}
              onDelete={handleDeleteItinerary}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
