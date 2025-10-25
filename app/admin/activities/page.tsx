'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '@/firebase/client'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Trash2, Pencil, PlusCircle } from 'lucide-react'

interface Activity {
  id: string
  destinationId: string
  name: string
  description: string
  duration: string
  price: number
  imageUrl?: string
}

interface Destination {
  id: string
  name: string
}

export default function ActivitiesAdminPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedDestination, setSelectedDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Fetch destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      const snapshot = await getDocs(collection(db, 'destinations'))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      })) as Destination[]
      setDestinations(data)
    }
    fetchDestinations()
  }, [])

  // Fetch activities for the selected destination
  const fetchActivities = async () => {
    if (!selectedDestination) return
    setLoading(true)
    const q = query(
      collection(db, 'activities'),
      where('destinationId', '==', selectedDestination)
    )
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Activity[]
    setActivities(data)
    setLoading(false)
  }

  useEffect(() => {
    if (selectedDestination) fetchActivities()
  }, [selectedDestination])

  // Delete modal confirm
  const confirmDelete = async () => {
    if (!deleteId) return
    await deleteDoc(doc(db, 'activities', deleteId))
    toast.success('🗑️ Activity deleted successfully!')
    setDeleteId(null)
    fetchActivities()
  }

  return (
    <section className="min-h-screen bg-white px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
          <h1 className="text-3xl font-bold text-blue-800 flex items-center gap-2">
            <MapPin className="text-blue-600" /> Activities
          </h1>
          <Link
            href="/admin/add-activity"
            className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition"
          >
            <PlusCircle size={18} /> Add Activity
          </Link>
        </div>

        {/* Destination Filter */}
        <div className="mb-8">
          <label className="block font-semibold mb-2 text-gray-700">
            Select Destination
          </label>
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose Destination --</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Activities Grid */}
        {loading ? (
          <p className="text-center text-gray-500 py-24">Loading...</p>
        ) : activities.length === 0 ? (
          <p className="text-center text-gray-500 py-24">
            😕 No activities found for this destination.
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                className="bg-white border rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                {activity.imageUrl && (
                  <Image
                  src={activity.imageUrl || '/images/fallback.jpg'}
                  alt={activity.name || 'Activity Image'}
                  width={400}
                  height={200}
                  className="object-cover w-full h-48"
                  unoptimized
                />

                )}
                <div className="p-5 space-y-2">
                  <h3 className="text-lg font-bold text-blue-800">
                    {activity.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-700">
                    <span>
                      <Clock className="inline h-4 w-4 mr-1 text-blue-500" />
                      {activity.duration}
                    </span>
                    <span className="font-semibold text-green-700">
                      ₱{activity.price.toLocaleString()}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between items-center mt-4">
                    <Link
                      href={`/admin/add-activity?edit=${activity.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    >
                      <Pencil size={15} /> Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(activity.id)}
                      className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this activity? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
