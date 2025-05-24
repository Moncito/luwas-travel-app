// components/(admin)/WeatherSummaryCards.tsx
'use client'

import { useEffect, useState } from 'react'

interface WeatherStat {
  month: string
  avgTemp: number
  totalBookings: number
  topCondition: string
}

export default function WeatherSummaryCards() {
  const [data, setData] = useState<WeatherStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/analytics/weather-trends')
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <p className="text-gray-500">Loading weather insights...</p>
  if (data.length === 0) return <p className="text-red-500">No analytics found.</p>

  // Sort by bookings
  const sorted = [...data].sort((a, b) => b.totalBookings - a.totalBookings)
  const highest = sorted[0]
  const lowest = sorted[sorted.length - 1]
  const moderate = sorted[Math.floor(sorted.length / 2)]

  const renderCard = (label: string, stat: WeatherStat, color: string) => (
    <div className={`p-6 rounded-xl shadow-sm border bg-${color}-50 text-${color}-900`}>
      <p className="text-sm font-semibold uppercase">{label}</p>
      <h2 className="text-lg font-bold mt-1">{stat.month}</h2>
      <p className="text-sm mt-2">📦 {stat.totalBookings} bookings</p>
      <p className="text-sm">🌡️ {stat.avgTemp}°C average temp</p>
      <p className="text-sm">🌤️ Mostly {stat.topCondition}</p>
      <p className="text-xs mt-3 italic text-gray-600">
        Expectation: {generateForecast(stat, data)}
      </p>
    </div>
  )

  const generateForecast = (stat: WeatherStat, all: WeatherStat[]) => {
    const currentIndex = all.findIndex(m => m.month === stat.month)
    const next = all[currentIndex + 1]
    if (next) {
      return `Possible increase in ${next.month} if ${next.avgTemp}°C and ${next.topCondition.toLowerCase()}`
    }
    return `Monitor following months for trend consistency.`
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {renderCard('📈 Highest Bookings', highest, 'green')}
      {renderCard('📊 Moderate', moderate, 'blue')}
      {renderCard('📉 Lowest Bookings', lowest, 'red')}
    </section>
  )
}
