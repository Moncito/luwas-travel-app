'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

interface Props {
  lat?: number;
  lon?: number;
  label?: string; // ✅ Add this
}

export default function DestinationMap({ lat, lon, label = '📍 Selected Location' }: Props) {
  if (
    typeof lat !== 'number' ||
    typeof lon !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lon)
  ) {
    return null;
  }

  const position: [number, number] = [lat, lon];

  return (
    <MapContainer
      center={position}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-80 rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          {label}
          <br />
          {lat.toFixed(4)}, {lon.toFixed(4)}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
