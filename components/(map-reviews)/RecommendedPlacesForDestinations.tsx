'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, ImagePlus } from 'lucide-react';

type Place = {
  title?: string;
  image: string;
  description?: string;
  link: string;
};

type Props = {
  destination: string;
  places: Place[];
};

const RecommendedPlacesForDestinations: React.FC<Props> = ({ destination, places }) => {
  if (!places || !Array.isArray(places)) return null;

  const displayedPlaces = places.slice(0, 6);
  const hasNoData = displayedPlaces.length === 0;

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
        Places to Visit in {destination}
      </h2>

      {hasNoData ? (
        <p className="text-sm text-gray-500 italic text-center">
          No popular spots found near this location. Try exploring the area manually or check back later.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayedPlaces.map((place, index) => {
            const rawTitle = place.title?.trim();
            const title = rawTitle && rawTitle.toLowerCase().includes('recommended spot')
              ? `Spot near ${destination} #${index + 1}`
              : rawTitle || `Spot near ${destination} #${index + 1}`;

            const rawDesc = place.description?.trim();
            const description = rawDesc && rawDesc.toLowerCase().includes('recommended spot')
              ? `One of the known places to visit around ${destination}.`
              : rawDesc || `A place to check out near ${destination}.`;

            const image = place.image || '/images/fallback.jpg';

            return (
              <div
                key={`${title}-${index}`}
                className="bg-white rounded-2xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={image}
                    alt={`Photo of ${title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover rounded-t-2xl"
                    priority
                  />
                </div>

                <div className="p-5 space-y-2 text-center">
                  <h3 className="font-bold text-lg text-gray-800 truncate">{title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{description}</p>

                  <div className="flex flex-col items-center space-y-2 mt-4">
                    <a
                      href={place.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition w-full"
                    >
                      <MapPin size={16} />
                      View on Map
                    </a>

                    <a
                      href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                        `${title} ${destination}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 text-sm text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded-md transition w-full"
                    >
                      <ImagePlus size={16} />
                      View Photos on Google
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RecommendedPlacesForDestinations;
