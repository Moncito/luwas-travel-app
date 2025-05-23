'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface MapPickerClientProps {
  onSelectLocation: (coords: { lat: number; lng: number }) => void
}

export default function MapPickerClient({ onSelectLocation }: MapPickerClientProps) {
  const [position, setPosition] = useState<[number, number]>([14.5995, 120.9842])
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        setPosition([lat, lng])
        onSelectLocation({ lat, lng })
      },
    })

    return (
      <Marker position={position} icon={markerIcon}>
        <Popup>
          📍 Selected Location<br />
          Lat: {position[0].toFixed(4)}<br />
          Lng: {position[1].toFixed(4)}
        </Popup>
      </Marker>
    )
  }

  function FlyToMap({ position }: { position: [number, number] }) {
    const map = useMap()

    useEffect(() => {
      map.flyTo(position, 13)
    }, [position, map])

    return null
  }

  // Fetch search suggestions
  useEffect(() => {
    const controller = new AbortController()
    const delay = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchTerm
          )}&format=json&addressdetails=1&limit=5`,
          { signal: controller.signal }
        )
        const data = await res.json()
        setSuggestions(data)
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err)
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => {
      controller.abort()
      clearTimeout(delay)
    }
  }, [searchTerm])

  const handleSelect = (place: any) => {
    const lat = parseFloat(place.lat)
    const lng = parseFloat(place.lon)
    setPosition([lat, lng])
    onSelectLocation({ lat, lng })
    setSuggestions([])
    setSearchTerm(place.display_name)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setSuggestions([])
  }

  return (
    <div className="w-full space-y-4 relative">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom
        className="rounded-lg z-0"
        style={{ height: '300px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors, Tiles: OpenTopoMap'
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
        <FlyToMap position={position} />
      </MapContainer>

      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Search location..."
          className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-2 text-gray-500 hover:text-red-500"
            title="Clear"
          >
            ✕
          </button>
        )}

        {loading && (
          <div className="text-sm text-blue-500 mt-1">Searching...</div>
        )}

        {suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 bg-white shadow-md border rounded mt-1 z-[999] max-h-48 overflow-y-auto">
            {suggestions.map((place, i) => (
              <li
                key={i}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                onClick={() => handleSelect(place)}
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}

        {!loading && searchTerm && suggestions.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">No results found.</p>
        )}
      </div>
    </div>
  )
}
