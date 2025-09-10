'use client'

import { useEffect, useState } from 'react'
import PromoCard from './PromoCard'

interface Promo {
  id: string
  title: string
  description: string
  discountPercentage: number
  price: number
  finalPrice: number
  startDate: string
  endDate: string
  location: string
  imageUrl?: string
}

interface Props {
  searchTerm: string
}

export default function PromoList({ searchTerm }: Props) {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch('/api/promos')
        const data = await res.json()
        setPromos(data)
      } catch (err) {
        console.error('❌ Failed to load promos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPromos()
  }, [])

  const filtered = promos.filter((p) =>
    [p.title, p.description].some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (loading) {
    return (
      <section className="bg-white py-20">
        <p className="text-center text-gray-500">Loading promos...</p>
      </section>
    )
  }

  if (filtered.length === 0) {
    return (
      <section className="bg-white py-20 px-6">
        <div className="max-w-md mx-auto text-center bg-white border border-gray-200 rounded-2xl shadow-lg p-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No promos available
          </h3>
          <p className="text-gray-600 text-sm">
            We currently don’t have any active promotions.  
            Please check back later for new deals and discounts.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-12">
      <div className="grid gap-8 px-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {filtered.map((promo) => (
          <PromoCard key={promo.id} {...promo} />
        ))}
      </div>
    </section>
  )
}
