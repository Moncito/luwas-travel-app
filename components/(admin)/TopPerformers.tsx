'use client'

import { useEffect, useState } from 'react'

interface Performer {
  name: string
  imageUrl: string
  count?: number
  travelers?: number
  growth: number
}

export default function TopPerformers() {
  const [top, setTop] = useState<{ topDestination: Performer; topItinerary: Performer } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/top-performers')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load top performers')
        return res.json()
      })
      .then(data => {
        console.log('✅ Top Performers Data:', data)
        setTop(data)
      })
      .catch(err => {
        console.error('❌ Failed to fetch top performers:', err)
        setError('Could not fetch top performers.')
      })
  }, [])

  if (error) {
    return (
      <div className="p-4 text-red-500 text-sm text-center mt-4 rounded-md bg-red-50 border border-red-200">
        {error}
      </div>
    )
  }

  if (!top) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center mt-4">
        Loading top performers...
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {[{
        ...top.topDestination,
        label: 'Top Destination',
        metric: `${top.topDestination?.count ?? 0} bookings`
      }, {
        ...top.topItinerary,
        label: 'Top Itinerary',
        metric: `${top.topItinerary?.travelers ?? 0} travelers`
      }].map((item, i) => (
        <div
          key={i}
          className="relative rounded-xl overflow-hidden shadow-lg bg-center bg-cover min-h-[200px]"
          style={{
            backgroundImage: `url(${item.imageUrl?.startsWith('http') ? item.imageUrl : 'https://i.imgur.com/Lq3Q8O3.jpg'})`,
            backgroundColor: !item.imageUrl ? '#1e40af' : undefined
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-4 text-white">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-300">{item.label}</p>
              <h2 className="text-2xl font-bold">{item.name}</h2>
              <p className="text-sm text-white">{item.metric}</p>
            </div>
            <p className={`text-sm ${item.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.growth >= 0 ? `↑ ${item.growth}%` : `↓ ${Math.abs(item.growth)}%`} vs last month
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
