// components/MapPicker.tsx
'use client'

import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('@/components/MapPickerClient'), {
  ssr: false,
})

interface MapPickerProps {
  onSelectLocation: (lat: number, lng: number) => void
}

export default function MapPicker({ onSelectLocation }: MapPickerProps) {
  return (
    <div className="h-[300px] w-full rounded border overflow-hidden">
      <LeafletMap onSelectLocation={onSelectLocation} />
    </div>
  )
}
