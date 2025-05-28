'use client'

import dynamic from 'next/dynamic'

// Dynamically load the actual Leaflet map component
const DestinationMap = dynamic(() => import('./DestinationMap'), {
  ssr: false,
})

export default function DestinationMapClientWrapper({ lat, lon }: { lat: number; lon: number }) {
  return <DestinationMap lat={lat} lon={lon} />
}
