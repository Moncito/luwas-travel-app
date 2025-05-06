// components/(admin)/DestinationCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'

interface Props {
  destination: {
    id: string
    name: string
    location: string
    imageUrl: string
    price: number
  }
  onDelete: (id: string) => void
}

export default function DestinationCard({ destination, onDelete }: Props) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <Image
        src={destination.imageUrl}
        alt={destination.name}
        width={600}
        height={300}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h2 className="font-bold text-lg">{destination.name}</h2>
        <p className="text-sm text-gray-600">{destination.location}</p>
        <p className="text-sm text-gray-500 mt-1">₱{destination.price}</p>
        <div className="flex gap-2 mt-4">
          <Link
            href={`/admin/edit-destination/${destination.id}`}
            className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(destination.id)}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
