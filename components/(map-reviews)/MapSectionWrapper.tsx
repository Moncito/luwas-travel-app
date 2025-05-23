'use client'

import DestinationMap from './DestinationMap'

interface Props {
  lat?: number
  lng?: number
  label?: string
}

export default function MapSectionWrapper({ lat, lng, label }: Props) {
  if (!lat || !lng) return null

  return (
    <section className="max-w-4xl mx-auto px-6 pb-20">
      <h2 className="text-xl font-bold text-blue-900 text-center mb-4">📍 Location</h2>
      <DestinationMap lat={lat} lon={lng} />
    </section>
  )
}
