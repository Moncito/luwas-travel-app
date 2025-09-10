// File: components/(admin-promos)/PromoCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Props {
  promo: {
    id: string
    title: string
    description: string
    discountPercentage: number
    price: number
    finalPrice: number
    imageUrl: string
  }
  onDelete: (id: string) => void
}

export default function PromoCard({ promo, onDelete }: Props) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <Image
        src={promo.imageUrl}
        alt={promo.title}
        width={600}
        height={300}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="font-bold text-lg">{promo.title}</h2>
        <p className="text-sm text-gray-600 line-clamp-2">{promo.description}</p>
        <p className="text-sm text-gray-500 mt-1">
          Original: ₱{promo.price.toLocaleString()}
        </p>
        <p className="text-base font-semibold text-green-600">
          ₱{promo.finalPrice.toLocaleString()} ({promo.discountPercentage}% OFF)
        </p>

        <div className="flex gap-2 mt-4">
          <Link
            href={`/admin/edit-promo/${promo.id}`}
            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(promo.id)}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
