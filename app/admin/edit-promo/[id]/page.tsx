// File: app/admin/edit-promo/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/client'
import { toast } from 'sonner'

interface Promo {
  title: string
  description: string
  discountPercentage: number
  price: number
  finalPrice: number
  imageUrl: string
}

export default function EditPromoPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Promo>({
    title: '',
    description: '',
    discountPercentage: 0,
    price: 0,
    finalPrice: 0,
    imageUrl: '',
  })

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const docRef = doc(db, 'promos', id as string)
        const snap = await getDoc(docRef)

        if (!snap.exists()) {
          toast.error('Promo not found')
          router.push('/admin/trips')
          return
        }

        const data = snap.data() as Promo
        setForm(data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load promo')
        router.push('/admin/trips')
      } finally {
        setLoading(false)
      }
    }

    fetchPromo()
  }, [id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const docRef = doc(db, 'promos', id as string)
      const price = Number(form.price)
      const discountPercentage = Number(form.discountPercentage)
      const finalPrice = price - (price * (discountPercentage / 100))

      await updateDoc(docRef, {
        ...form,
        price,
        discountPercentage,
        finalPrice,
      })

      toast.success('Promo updated!')
      router.push('/admin/trips')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update promo')
    }
  }

  if (loading) return <p className="p-6">Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">Edit Promo</h2>

      <input
        className="w-full border p-2 rounded"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        required
      />

      <textarea
        className="w-full border p-2 rounded"
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        rows={3}
        required
      />

      <input
        className="w-full border p-2 rounded"
        type="number"
        name="price"
        value={form.price}
        onChange={handleChange}
        placeholder="Price"
        required
      />

      <input
        className="w-full border p-2 rounded"
        type="number"
        name="discountPercentage"
        value={form.discountPercentage}
        onChange={handleChange}
        placeholder="Discount (%)"
        required
      />

      <input
        className="w-full border p-2 rounded"
        name="imageUrl"
        value={form.imageUrl}
        onChange={handleChange}
        placeholder="Image URL"
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </form>
  )
}
