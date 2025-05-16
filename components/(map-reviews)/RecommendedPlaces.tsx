'use client'

import React from 'react'

type Place = {
  title: string
  image: string
  description: string
  link: string
}

type Props = {
  destination: string // e.g., 'Baguio'
  places: Place[]
}

const RecommendedPlaces: React.FC<Props> = ({ destination, places }) => {
  if (!places) return null

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        🏞️ Places to Visit in {destination}
      </h2>

      {places.length === 0 ? (
        <p className="text-sm text-gray-500">No recommended places found nearby.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {places.map((place, index) => (
            <div
              key={`${place.title}-${index}`}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <img
                src={place.image}
                alt={place.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{place.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{place.description}</p>
                <a
                  href={place.link}
                  className="text-blue-600 text-sm underline mt-2 inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Map
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default RecommendedPlaces
