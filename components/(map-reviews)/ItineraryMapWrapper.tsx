'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load the map component on client only
const DynamicMap = dynamic(() => import('./DestinationMap'), { ssr: false });

export default function ItineraryMapWrapper({
  lat,
  lon,
  label = '',
}: {
  lat: number;
  lon: number;
  label?: string;
}) {
  return <DynamicMap lat={lat} lon={lon} label={label} />;
}
