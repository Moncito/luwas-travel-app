'use client'

import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const MapPickerClient = dynamic(() => import('@/components/MapPickerClient'), { ssr: false })

export default function AddItineraryForm({ onAdd }: { onAdd?: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [highlights, setHighlights] = useState('')
  const [price, setPrice] = useState('')
  const [slug, setSlug] = useState('')
  const [image, setImage] = useState('')
  const [location, setLocation] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!title || !description || !duration || !highlights || !price || !slug || !image || latitude === null || longitude === null || !location) {
      toast.error('Please fill out all fields and select a location.')
      setLoading(false)
      return
    }

    try {
      await addDoc(collection(db, 'itineraries'), {
        title,
        description,
        duration,
        highlights: highlights.split(',').map(h => h.trim()),
        price: Number(price),
        slug,
        image,
        location,
        latitude,
        longitude,
        createdAt: serverTimestamp(),
      })

      toast.success('Itinerary added!')
      if (onAdd) onAdd()

      // Reset fields
      setTitle('')
      setDescription('')
      setDuration('')
      setHighlights('')
      setPrice('')
      setSlug('')
      setImage('')
      setLocation('')
      setLatitude(null)
      setLongitude(null)

    } catch (err) {
      toast.error('Error saving itinerary.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-blue-800 text-center">Add New Itinerary</h2>

      <input className="w-full border p-2 rounded" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="w-full border p-2 rounded" placeholder="Slug (e.g. palawan-escape)" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      <input className="w-full border p-2 rounded" placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} required />
      <input className="w-full border p-2 rounded" placeholder="Location (e.g. Palawan)" value={location} onChange={(e) => setLocation(e.target.value)} required />
      <input className="w-full border p-2 rounded" placeholder="Duration (e.g. 3 days, 2 nights)" value={duration} onChange={(e) => setDuration(e.target.value)} required />
      <textarea className="w-full border p-2 rounded" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
      <input className="w-full border p-2 rounded" placeholder="Highlights (comma-separated)" value={highlights} onChange={(e) => setHighlights(e.target.value)} required />
      <input className="w-full border p-2 rounded" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />

      <MapPickerClient
        onSelectLocation={({ lat, lng }: { lat: number; lng: number }) => {
          setLatitude(lat)
          setLongitude(lng)
        }}
      />
      {latitude !== null && longitude !== null && (
        <p className="text-green-600 text-sm">
          Selected Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800"
      >
        {loading ? 'Submitting...' : 'Add Itinerary'}
      </button>
    </form>
  )
}
