'use client'

import { useEffect, useState } from 'react'
import {
  addDoc,
  updateDoc,
  getDoc,
  doc,
  collection,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/client'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Tags,
  MapPin,
  DollarSign,
  Clock,
  Compass,
  PlusCircle,
  Save,
  RefreshCcw,
} from 'lucide-react'
import ImageUploader from './ImageUploader'


export default function AddActivityPanel() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [destinations, setDestinations] = useState<{ id: string; name: string }[]>([])
  const [selectedDestination, setSelectedDestination] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [dayRecommendation, setDayRecommendation] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // 🏝️ Fetch all destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      const q = query(collection(db, 'destinations'), orderBy('name'))
      const snapshot = await getDocs(q)
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }))
      setDestinations(list)
    }
    fetchDestinations()
  }, [])

  // 🧩 If editing, fetch the activity data
  useEffect(() => {
    const fetchActivity = async () => {
      if (!editId) return
      setIsEditing(true)
      const ref = doc(db, 'activities', editId)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        setSelectedDestination(data.destinationId || '')
        setTitle(data.title || '')
        setCategory(data.category || '')
        setPrice(data.price?.toString() || '')
        setDuration(data.durationHours?.toString() || '')
        setDayRecommendation(data.dayRecommendation || '')
        setDescription(data.description || '')
        setImageUrl(data.imageUrl || '')
      } else {
        toast.error('⚠️ Activity not found.')
      }
    }
    fetchActivity()
  }, [editId])

  // 💾 Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDestination || !title || !price || !description) {
      toast.error('⚠️ Please fill out all required fields.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        destinationId: selectedDestination,
        title,
        category: category || 'General',
        price: Number(price),
        durationHours: duration ? Number(duration) : null,
        dayRecommendation: dayRecommendation ? Number(dayRecommendation) : null,
        description,
        imageUrl,
        updatedAt: serverTimestamp(),
      }

      if (isEditing && editId) {
        await updateDoc(doc(db, 'activities', editId), payload)
        toast.success('✅ Activity updated successfully!')
      } else {
        await addDoc(collection(db, 'activities'), {
          ...payload,
          createdAt: serverTimestamp(),
        })
        toast.success('✅ New activity added successfully!')
      }

      // Reset form if not editing
      if (!isEditing) {
        setSelectedDestination('')
        setTitle('')
        setCategory('')
        setPrice('')
        setDuration('')
        setDayRecommendation('')
        setDescription('')
        setImageUrl('')
      }
    } catch (err) {
      console.error('❌ Firestore error:', err)
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message?: unknown }).message || '')
            : ''

      if (message) {
        toast.error(`Error saving activity: ${message}`)
      } else {
        toast.error('Error saving activity.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="bg-white p-8 rounded-2xl shadow-lg max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-2xl font-bold text-blue-700 mb-8 flex items-center gap-2">
        <Tags className="h-6 w-6 text-blue-600" />{' '}
        {isEditing ? 'Edit Activity' : 'Add New Activity'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 🗺 Destination Dropdown */}
        <div>
          <label className="block font-semibold mb-2">Select Destination</label>
          <select
            className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            required
          >
            <option value="">-- Choose Destination --</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✏️ Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Activity Title (e.g. Island Hopping Tour)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Category (e.g. Adventure, Culture)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        {/* 💰 Price, ⏱ Duration, 📍 Day */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <DollarSign className="text-green-600 w-5 h-5" />
            <input
              type="number"
              min="0"
              step="0.01"
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Price (₱)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <Clock className="text-blue-600 w-5 h-5" />
            <input
              type="number"
              min="0"
              step="0.5"
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Duration (hours)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="text-orange-600 w-5 h-5" />
            <input
              type="number"
              min="1"
              className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
              placeholder="Suggested Day (e.g. 1, 2, 3)"
              value={dayRecommendation}
              onChange={(e) =>
                setDayRecommendation(e.target.value ? Number(e.target.value) : '')
              }
            />
          </div>
        </div>

        {/* 📝 Description */}
        <textarea
          className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the activity (what to expect, inclusions, etc.)"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* 🖼 Image Upload */}
        <div>
          <label className="block font-semibold mb-2">Activity Image</label>
          <ImageUploader 
            onUploadStart={() => setUploadingImage(true)}
            onUploadComplete={(url) => {
              setImageUrl(url)
              setUploadingImage(false)
            }} 
            onUploadError={() => setUploadingImage(false)}
          />
          {uploadingImage && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              ⏳ Image uploading... Please wait before submitting
            </div>
          )}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title || 'Activity Image'}
              className="mt-4 h-40 w-full object-cover rounded-lg border shadow-sm"
            />
          )}
        </div>

        {/* ✅ Buttons */}
        <div className="flex justify-end gap-4">
          {isEditing && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              <RefreshCcw size={18} /> Reset
            </button>
          )}
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg transition shadow ${
              loading || uploadingImage
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              'Saving...'
            ) : uploadingImage ? (
              '⏳ Uploading...'
            ) : isEditing ? (
              <>
                <Save size={18} /> Update Activity
              </>
            ) : (
              <>
                <PlusCircle size={18} /> Add Activity
              </>
            )}
          </button>
        </div>
      </form>

      {/* ⚓ Quick Navigation */}
      <div className="mt-12 border-t pt-8">
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Compass className="h-5 w-5 text-blue-600" /> Next Steps
        </h3>
        <p className="text-gray-500 mb-6">
          You can now review your destination activities or create a new trip package.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/admin/destinations"
            className="border-2 border-blue-200 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-all"
          >
            <MapPin className="h-10 w-10 text-blue-600 mb-3" />
            <h4 className="font-semibold text-gray-800 mb-1">
              Manage Destinations
            </h4>
            <p className="text-gray-500 text-sm">
              View or edit existing destinations in your system.
            </p>
          </Link>

          <Link
            href="/admin/trip-packages"
            className="border-2 border-green-200 hover:border-green-400 rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-all"
          >
            <Tags className="h-10 w-10 text-green-600 mb-3" />
            <h4 className="font-semibold text-gray-800 mb-1">
              Manage Trip Packages
            </h4>
            <p className="text-gray-500 text-sm">
              Combine multiple activities into pre-planned travel experiences.
            </p>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
