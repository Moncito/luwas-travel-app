'use client';

import Image from 'next/image';
import Link from 'next/link';

interface PromoProps {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  price: number;
  finalPrice: number;
  endDate: string;
  location: string;
  imageUrl?: string;
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
    <div
      className="
        flex flex-col overflow-hidden rounded-2xl
        border border-gray-300 bg-white/70 backdrop-blur-md
        shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]
      "
    >
      {/* 🖼️ Image Section */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={imageUrl || '/images/placeholder.jpg'}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
        <span
          className="
            absolute top-3 left-3 bg-red-600 text-white text-xs 
            font-bold px-3 py-1 rounded-full shadow-md
          "
        >
          {discountPercentage}% OFF
        </span>
      </div>

      {/* 📜 Content Section */}
      <div className="flex flex-col justify-between flex-1 p-6 text-center text-black">
        <div className="flex flex-col items-center space-y-2 min-h-[160px]">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-black/70 line-clamp-3">{description}</p>

          <p className="text-sm font-medium text-black">📍 {location}</p>

          {/* 💰 Price Section */}
          <div className="flex justify-center items-center gap-3 mt-2">
            <p className="text-gray-500 line-through text-sm font-semibold">
              ₱{price.toLocaleString()}
            </p>
            <p className="text-xl font-bold text-black">
              ₱{finalPrice.toLocaleString()}
            </p>
          </div>

          {/* 🕓 Validity */}
          <p className="text-xs text-black/80 font-medium mt-2">
            Valid until: {endDate ? new Date(endDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        {/* CTA Button */}
        <div className="mt-6">
          <Link
            href={`/promos/${id}`}
            className="
              inline-block text-sm font-medium border border-black px-4 py-2 rounded-md
              hover:bg-black hover:text-white transition
            "
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
