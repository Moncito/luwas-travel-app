'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/client'
import DestinationCard from '@/components/(admin)/DestinationCard'
import AddItineraryCard from '@/components/(admin-itineraries)/AddItineraryCard'
import PromoCard from '@/components/(admin-promos)/PromoCard'
import { toast } from 'sonner'

// ✅ Interfaces
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

interface Promo {
  id: string
  title: string
  description: string
  discountPercentage: number
  price: number
  finalPrice: number
  imageUrl: string
}

export default function AdminTripsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [promos, setPromos] = useState<Promo[]>([])

  // Fetch all collections
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Destinations
        const destSnapshot = await getDocs(collection(db, 'destinations'))
        const destData = destSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Destination, 'id'>),
        }))
        setDestinations(destData)

        // Itineraries
        const itinerarySnapshot = await getDocs(collection(db, 'itineraries'))
        const itineraryData = itinerarySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Itinerary, 'id'>),
        }))
        setItineraries(itineraryData)

        // Promos
        const promoSnapshot = await getDocs(collection(db, 'promos'))
        const promoData = promoSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Promo, 'id'>),
        }))
        setPromos(promoData)
      } catch (err) {
        console.error(err)
        toast.error('❌ Failed to load admin data')
      }
    }

    fetchData()
  }, [])

  // Delete handlers
  const handleDeleteDestination = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'destinations', id))
      setDestinations(prev => prev.filter(d => d.id !== id))
      toast.success('Destination deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete destination')
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

  const handleDeletePromo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'promos', id))
      setPromos(prev => prev.filter(p => p.id !== id))
      toast.success('Promo deleted')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete promo')
    }
  }

  return (
    <section className="p-6 space-y-16">
      {/* Destinations Section */}
      <div>
        <h1 className="text-2xl font-bold text-blue-700 mb-6">Destinations</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map(dest => (
            <DestinationCard
              key={dest.id}
              destination={dest}
              onDelete={handleDeleteDestination}
            />
          ))}
        </div>
      </div>

      {/* Itineraries Section */}
      <div>
        <h1 className="text-2xl font-bold text-green-700 mb-6">Itineraries</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map(itinerary => (
            <AddItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              onDelete={handleDeleteItinerary}
            />
          ))}
        </div>
      </div>

      {/* Promos Section */}
      <div>
        <h1 className="text-2xl font-bold text-red-700 mb-6">Promos</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promos.map(promo => (
            <PromoCard
              key={promo.id}
              promo={promo}
              onDelete={handleDeletePromo}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
