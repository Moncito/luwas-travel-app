'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ItineraryProps {
  slug: string;
  title: string;
  imageUrl: string;
  duration?: string;
  highlights: string[];
  price?: number;
}

export default function ItineraryCard({
  slug,
  title,
  imageUrl,
  duration = 'Multi-day Trip',
  highlights,
  price = 0
}: ItineraryProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 text-black flex flex-col">
      {/* Image */}
      <div className="relative h-56 w-full">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow justify-between text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm italic text-black/80">{duration}</p>
          <p className="text-base font-semibold">
            ₱{price.toLocaleString()} per person
          </p>

          <ul className="text-sm text-black/80 list-disc list-inside space-y-1 max-w-xs mx-auto min-h-[72px]">
            {highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="truncate">{h}</li>
            ))}
          </ul>
        </div>

        {/* Button aligned at bottom */}
        <div className="pt-4">
          <Link
            href={`/itineraries/${slug}`}
            className="inline-block text-sm font-medium underline underline-offset-4 hover:text-gray-800 transition"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
