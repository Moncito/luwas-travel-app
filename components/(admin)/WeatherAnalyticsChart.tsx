// components/(admin)/WeatherAnalyticsChart.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

interface WeatherStat {
  month: string
  avgTemp: number
  totalBookings: number
  topCondition: string
}

export default function WeatherAnalyticsChart() {
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

  const orderedMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => orderedMonths.indexOf(a.month) - orderedMonths.indexOf(b.month))
  }, [data])

  if (loading) return <p className="text-gray-500 mt-6">Loading chart...</p>

  return (
    <div className="mt-10 p-8 bg-white rounded-xl shadow-sm border">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">📊 Weather & Bookings Analytics</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={sortedData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" stroke="#1e3a8a" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 12 }} label={{ value: 'Bookings', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 12 }} label={{ value: 'Temp °C', angle: 90, position: 'insideRight' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#f0f9ff', borderRadius: 8 }}
            labelStyle={{ fontWeight: 'bold', color: '#0c4a6e' }}
            formatter={(value, name) => name === 'avgTemp' ? `${value}°C` : value}
            labelFormatter={(label) => `📅 ${label}`}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar yAxisId="left" dataKey="totalBookings" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="avgTemp" name="Avg Temp" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
