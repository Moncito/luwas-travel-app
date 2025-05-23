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
        router.push('/admin/trips')
      }
    }

    fetchItinerary()
  }, [id])

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
      toast.success('Itinerary updated!')
      router.push('/admin/trips')
    } catch (err) {
      console.error(err)
      toast.error('❌ Failed to update itinerary')
    }
  }

  if (loading) return <p className="p-6">Loading itinerary...</p>

  return (
    <section className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Edit Itinerary</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="duration"
          value={form.duration}
          onChange={handleChange}
          placeholder="Duration (e.g. 3 Days)"
          className="w-full p-2 border rounded"
        />
        <input
          name="image"
          value={form.image}
          onChange={handleChange}
          placeholder="Image URL"
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="price"
          value={form.price}
          onChange={handleChange}
          type="number"
          placeholder="Price"
          className="w-full p-2 border rounded"
          required
        />

        <div className="space-y-2">
          <p className="font-medium">Highlights</p>
          {form.highlights.map((h, i) => (
            <input
              key={i}
              value={h}
              onChange={(e) => handleHighlightChange(i, e.target.value)}
              placeholder={`Highlight ${i + 1}`}
              className="w-full p-2 border rounded"
            />
          ))}
          <button
            type="button"
            onClick={addHighlight}
            className="text-blue-600 text-sm"
          >
            + Add another highlight
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-700 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </form>
    </section>
  )
}
