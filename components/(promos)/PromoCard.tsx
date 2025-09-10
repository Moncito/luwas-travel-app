'use client'

import Image from 'next/image'
import Link from 'next/link'

interface PromoProps {
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

export default function PromoCard({
  id,
  title,
  description,
  discountPercentage,
  price,
  finalPrice,
  endDate,
  location,
  imageUrl,
}: PromoProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative h-52 w-full">
        <Image
          src={imageUrl || '/placeholder.jpg'}
          alt={title}
          fill
          priority
          className="object-cover"
        />
        {/* Discount Badge */}
        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
          {discountPercentage}% OFF
        </span>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div className="space-y-3 text-center">
          {/* Title */}
          <h2 className="text-lg font-extrabold text-black line-clamp-2">
            {title}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-700 font-medium line-clamp-3">
            {description}
          </p>

          {/* Location */}
          <p className="text-sm text-black font-semibold">{location}</p>

          {/* Price Section */}
          <div className="flex justify-center gap-3 items-center">
            <p className="text-gray-500 line-through text-sm font-semibold">
              ₱{price.toLocaleString()}
            </p>
            <p className="text-xl font-extrabold text-black">
              ₱{finalPrice.toLocaleString()}
            </p>
          </div>

          {/* Validity */}
          <p className="text-xs text-black font-medium mt-1">
            Valid until: {endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-6">
         <Link
  href={`/promos/${id}`}
  className="block w-full text-center text-sm font-bold tracking-wide 
             text-white bg-gradient-to-r from-blue-600 to-blue-800 
             hover:from-blue-700 hover:to-blue-900 
             px-5 py-3 rounded-xl shadow-lg 
             transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
>
  View Details →
</Link>

        </div>
      </div>
    </div>
  )
}
