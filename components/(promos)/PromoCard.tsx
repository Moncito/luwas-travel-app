'use client';

import Image from 'next/image';
import Link from 'next/link';

interface PromoProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  discount: number; // percentage
  validUntil: string;
}

export default function PromoCard({
  id,
  title,
  description,
  imageUrl,
  discount,
  validUntil,
}: PromoProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || '/placeholder.jpg'}
          alt={title}
          fill
          className="object-cover rounded-t-2xl"
        />
        <div className="absolute inset-0 bg-black/20 rounded-t-2xl" />

        {/* Discount badge */}
        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
          {discount}% OFF
        </span>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow justify-between text-center">
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-blue-900">{title}</h2>
          <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
          <p className="text-xs text-gray-500">
            Valid until: {new Date(validUntil).toLocaleDateString()}
          </p>
        </div>

        {/* Button at bottom */}
        <div className="pt-4">
          <Link
            href={`/promos/${id}`}
            className="inline-block text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
