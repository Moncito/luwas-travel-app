'use client'

import { db } from '@/firebase/client'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function EditItineraryPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }

  const [form, setForm] = useState({
    title: '',
    duration: '',
    image: '',
    price: '',
    highlights: [''],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const docRef = doc(db, 'itineraries', id)
        const snap = await getDoc(docRef)

        if (!snap.exists()) {
          notFound()
        }

        const data = snap.data()
        setForm({
          title: data.title || '',
          duration: data.duration || '',
          image: data.image || '',
          price: String(data.price || ''),
          highlights: data.highlights || [''],
        })
        setLoading(false)
      } catch (err) {
        console.error('Failed to load itinerary', err)
        toast.error('Itinerary not found')
        router.push('/admin/itineraries')
      }
    }

    fetchItinerary()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...form.highlights]
    newHighlights[index] = value
    setForm(prev => ({ ...prev, highlights: newHighlights }))
  }

  const addHighlight = () => {
    setForm(prev => ({ ...prev, highlights: [...prev.highlights, ''] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateDoc(doc(db, 'itineraries', id), {
        ...form,
        price: Number(form.price),
        highlights: form.highlights.filter(h => h.trim() !== ''),
      })
      toast.success('✅ Itinerary updated!')
      router.push('/admin/itineraries')
    } catch (err) {
      console.error(err)
      toast.error('❌ Failed to update itinerary')
    }
  }

  if (loading) return <p className="p-6">Loading itinerary...</p>

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-6xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-8 text-blue-700">✏️ Edit Itinerary</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
            placeholder="Duration (e.g. 3 Days)"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
            placeholder="Price"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Highlights */}
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Highlights</p>
            {form.highlights.map((h, i) => (
              <input
                key={i}
                value={h}
                onChange={(e) => handleHighlightChange(i, e.target.value)}
                placeholder={`Highlight ${i + 1}`}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ))}
            <button
              type="button"
              onClick={addHighlight}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add another highlight
            </button>
          </div>

          <div className="flex justify-end gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.push('/admin/itineraries')}
              className="bg-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition shadow"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Right Column - Live Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Live Preview</h3>
          <div className="border rounded-xl shadow-md overflow-hidden max-w-md">
            {form.image ? (
              <img
                src={form.image}
                alt={form.title}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image Preview
              </div>
            )}
            <div className="p-4">
              <h4 className="text-xl font-bold text-gray-800">
                {form.title || "Itinerary Title"}
              </h4>
              <p className="text-sm text-gray-500">
                {form.duration || "Duration"}
              </p>
              <p className="text-blue-700 font-semibold mt-2">
                {form.price ? `₱${form.price}` : "₱0.00"}
              </p>
              <div className="mt-3 flex gap-2 flex-wrap">
                {form.highlights.length > 0 &&
                  form.highlights
                    .filter((h) => h.trim() !== "")
                    .map((h, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                      >
                        {h}
                      </span>
                    ))}
                {form.highlights.filter((h) => h.trim() !== "").length === 0 && (
                  <span className="text-gray-400 text-xs">#highlights</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
