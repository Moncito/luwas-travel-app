'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Package, Thermometer, CloudSun } from "lucide-react"

interface Trend {
  month: string
  destinationsAvgTemp: number | null
  itinerariesAvgTemp: number | null
  bookingCount: number | null
  itineraryCount: number | null
  topCondition: string
}

export default function WeatherSummaryCards() {
  const [data, setData] = useState<(Trend & { totalBookings: number; combinedAvgTemp: number | null })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/weather', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Status: ${res.status}`)
        const json: Trend[] = await res.json()

        const enriched = json.map(d => {
          const totalBookings = (d.bookingCount ?? 0) + (d.itineraryCount ?? 0)

          const temps: number[] = []
          if (typeof d.destinationsAvgTemp === 'number' && !isNaN(d.destinationsAvgTemp)) temps.push(d.destinationsAvgTemp)
          if (typeof d.itinerariesAvgTemp === 'number' && !isNaN(d.itinerariesAvgTemp)) temps.push(d.itinerariesAvgTemp)

          const combinedAvgTemp =
            temps.length > 0 ? temps.reduce((sum, t) => sum + t, 0) / temps.length : null

          return {
            ...d,
            totalBookings,
            combinedAvgTemp,
          }
        })

        setData(enriched)
      } catch (err) {
        console.error('Failed to load weather summary:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-gray-100 rounded-2xl"></div>
        ))}
      </section>
    )
  }

  if (data.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 text-red-700 border text-center">
        ⚠️ No weather analytics found.
      </div>
    )
  }

  const mostBooked = data.reduce((max, d) => d.totalBookings > max.totalBookings ? d : max, data[0])
  const hottest = data.reduce(
    (max, d) =>
      (d.combinedAvgTemp ?? -Infinity) > (max.combinedAvgTemp ?? -Infinity) ? d : max,
    data[0]
  )
  const coolest = data.reduce(
    (min, d) =>
      (d.combinedAvgTemp ?? Infinity) < (min.combinedAvgTemp ?? Infinity) ? d : min,
    data[0]
  )

  const renderCard = (
    label: string,
    stat: (typeof data)[0],
    gradient: string,
    icon: string,
    insight: string
  ) => (
    <Card className={`bg-gradient-to-br ${gradient} text-gray-900 rounded-2xl shadow-md hover:shadow-lg transition-all`}>
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
          {label}
        </p>
        <h2 className="text-xl font-bold mt-1">{stat.month || "N/A"}</h2>

        <div className="mt-3 space-y-1 text-sm">
          <p className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            {typeof stat.totalBookings === 'number' && !isNaN(stat.totalBookings)
              ? `${stat.totalBookings} total bookings`
              : 'No data'}
          </p>
          <p className="flex items-center gap-2">
            <Thermometer className="w-4 h-4" />
            {typeof stat.combinedAvgTemp === 'number' && !isNaN(stat.combinedAvgTemp)
              ? `${stat.combinedAvgTemp.toFixed(1)}°C avg temp`
              : 'No data'}
          </p>
          <p className="flex items-center gap-2">
            <CloudSun className="w-4 h-4" />
            Mostly {stat.topCondition || 'N/A'}
          </p>
        </div>

        <div className="mt-4">
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-white/70 text-gray-700 font-medium">
            {icon} {insight}
          </span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {renderCard(
        'Most Booked Month',
        mostBooked,
        'from-green-100 via-white to-green-50',
        '📈',
        'Peak travel demand — optimize offers'
      )}
      {renderCard(
        'Hottest Month',
        hottest,
        'from-orange-100 via-white to-orange-50',
        '🔥',
        'Expect high demand for beach trips'
      )}
      {renderCard(
        'Coolest Month',
        coolest,
        'from-blue-100 via-white to-blue-50',
        '❄️',
        'Travelers may prefer cozy indoor plans'
      )}
    </section>
  )
}
