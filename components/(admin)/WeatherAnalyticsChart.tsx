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

interface Trend {
  month: string
  avgTemp: number
  totalBookings: number
  topCondition: string
}

const emojiForCondition = (condition: string) => {
  if (/sun/i.test(condition)) return '☀️'
  if (/rain|shower/i.test(condition)) return '🌧️'
  if (/cloud/i.test(condition)) return '⛅'
  if (/storm|thunder/i.test(condition)) return '⛈️'
  return '🌥️'
}

export default function WeatherAnalyticsChart() {
  const [data, setData] = useState<Trend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/analytics/weather-trends')
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    fetchData()
  }, [])

  const highest = useMemo(() => {
    return data.reduce((prev, curr) =>
      curr.totalBookings > prev.totalBookings ? curr : prev,
    data[0] || { month: '', totalBookings: 0 })
  }, [data])

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading chart...</p>

  return (
    <div className="mt-10 p-8 rounded-xl bg-white shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bookings vs. Temperature</h2>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="chartBackground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ebf8ff" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f0f9ff" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" fill="url(#chartBackground)" />
          <XAxis dataKey="month" stroke="#374151" />
          <YAxis yAxisId="left" stroke="#10b981" />
          <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload
                return (
                  <div className="bg-white p-3 shadow rounded text-sm text-gray-800 border">
                    <p className="font-semibold">📅 {label}</p>
                    <p>📦 Bookings: {d.totalBookings}</p>
                    <p>🌡️ Avg Temp: {d.avgTemp}°C</p>
                    <p>{emojiForCondition(d.topCondition)} {d.topCondition}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="totalBookings"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
            barSize={40}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgTemp"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4 }}
            isAnimationActive={true}
            animationDuration={1200}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 📌 Insight Summary */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 border-l-4 border-blue-400 shadow-sm text-blue-900 text-sm leading-relaxed">
        <p className="font-semibold mb-1">💡 Insight:</p>
        <p>
          <strong>{highest?.month}</strong> had the most bookings (<strong>{highest?.totalBookings}</strong>) with an average temperature of <strong>{highest?.avgTemp}°C</strong>
          and mostly <span className="inline-flex items-center"><span className="text-xl mr-1">{emojiForCondition(highest?.topCondition)}</span><strong>{highest?.topCondition}</strong></span>.
        </p>
      </div>
    </div>
  )
}
