'use client'

import React from 'react'
import { MapPin, ImagePlus } from 'lucide-react'

type Place = {
  title: string
  image: string
  description: string
  link: string
}

type Props = {
  destination: string
  places: Place[]
}

const RecommendedPlaces: React.FC<Props> = ({ destination, places }) => {
  if (!places || !Array.isArray(places)) return null

  const maxPlaces = places.slice(0, 6)

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Places to Visit in {destination}
      </h2>

      {maxPlaces.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No popular spots found near this location. Try exploring the area manually or check back later.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {maxPlaces.map((place, index) => (
            <div
              key={`${place.title}-${index}`}
              className="bg-white rounded-2xl shadow-md overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <img
                src={place.image}
                alt={place.title}
                className="w-full h-48 object-cover rounded-t-2xl"
              />

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg text-gray-800">{place.title}</h3>
                <p className="text-sm text-gray-600">{place.description}</p>

                <div className="flex flex-col space-y-2 mt-4">
                  <a
                    href={place.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition"
                  >
                    <MapPin size={16} />
                    View on Map
                  </a>

                  <a
                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
                      place.title + ' Philippines'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-sm text-gray-700 border border-gray-300 hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded-md transition"
                  >
                    <ImagePlus size={16} />
                    View Photos on Google
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default RecommendedPlaces
