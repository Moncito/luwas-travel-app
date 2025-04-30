'use client'

import { useParams, useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { CalendarDays } from 'lucide-react'
import { toast } from 'sonner'

// Mock Data
const destinations = [
    {
        id: "1",
        name: "Boracay Island",
        location: "Aklan, Philippines",
        description: "Powdery white sands and vibrant nightlife await you.",
        imageUrl: "/images/boracay.png",
        tags: ["Beach", "Luxury"],
    },
    {
        id: "2",
        name: "Banaue Rice Terraces",
        location: "Ifugao, Philippines",
        description: "Marvel at the 2,000-year-old hand-carved mountains.",
        imageUrl: "/images/banaue.png",
        tags: ["Adventure", "Heritage"],
    },
    {
        id: "3",
        name: "El Nido",
        location: "Palawan, Philippines",
        description: "Secret lagoons, limestone cliffs, paradise waters.",
        imageUrl: "/images/elnido.png",
        tags: ["Beach", "Adventure"],
    },
  // Add other destinations...
]

export default function DestinationPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const destination = destinations.find((dest) => dest.id === id)
  if (!destination) return notFound()

  // 🔐 Auth check logic
  const handleStartPlanning = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/user')
      const data = await res.json()

      if (data.user) {
        // ✅ If logged in, redirect to booking form WITH destination info
        router.push(`/destinations/${id}/book`) // this route will contain the embedded form
      } else {
        toast.error('Please sign in to start planning your trip!')
        router.push('/sign-in')
      }
    } catch (err) {
      toast.error('Error checking authentication. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[70vh]">
        <Image
          src={destination.imageUrl}
          alt={destination.name}
          fill
          className="object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-black/40" />

        <motion.div
          className="absolute z-10 bottom-24 left-1/2 transform -translate-x-1/2 text-center px-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            {destination.name}
          </h1>
          <p className="text-white/80 text-lg">{destination.location}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {destination.tags.map((tag, idx) => (
              <span key={idx} className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Description + Button */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.p
          className="text-lg text-gray-700 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {destination.description}
        </motion.p>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <button
            onClick={handleStartPlanning}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-black text-white font-semibold px-6 py-3 rounded-full hover:bg-gray-800 transition-all duration-300 shadow-lg"
          >
            <CalendarDays className="w-5 h-5" />
            {loading ? 'Checking...' : 'Start Planning'}
          </button>
        </motion.div>
      </section>
    </main>
  )
}
