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
  price = 0,
}: ItineraryProps) {
  return (
    <div
      className="
        flex flex-col overflow-hidden rounded-2xl
        border border-gray-300 bg-white/70 backdrop-blur-md
        shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01]
      "
    >
      {/* Image Section */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-between flex-1 p-6 text-center text-black">
        <div className="flex flex-col items-center space-y-2 min-h-[160px]">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm italic">{duration}</p>
          <p className="text-base font-semibold">
            ₱{price.toLocaleString()} <span className="text-sm font-normal">per person</span>
          </p>

          {/* Highlights */}
          <ul className="text-sm list-disc list-inside space-y-1 max-w-xs mx-auto text-black/80">
            {highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="truncate">
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Button */}
        <div className="mt-6">
          <Link
            href={`/itineraries/${slug}`}
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
