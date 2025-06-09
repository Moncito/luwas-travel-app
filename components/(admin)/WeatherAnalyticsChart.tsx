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
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState('All')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/weather-trends')
        if (!res.ok) throw new Error(`Status: ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error('Failed to load weather analytics:', err)
        setError('Failed to load weather analytics.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const months = useMemo(() => Array.from(new Set(data.map(d => d.month))), [data])

  const filteredData = useMemo(() =>
    selectedMonth === 'All'
      ? data
      : data.filter(d => d.month === selectedMonth)
  , [selectedMonth, data])

  const insight = useMemo(() => {
    const base = selectedMonth === 'All'
      ? [...data].sort((a, b) => b.totalBookings - a.totalBookings)[0]
      : data.find(d => d.month === selectedMonth)
    return base || { month: '', totalBookings: 0, avgTemp: 0, topCondition: '' }
  }, [data, selectedMonth])

  if (loading) return (
    <div className="text-center mt-10">
      <div className="animate-spin inline-block w-8 h-8 border-4 rounded-full border-orange-300 border-t-transparent"></div>
      <p className="text-gray-500 mt-2">Loading weather trends...</p>
    </div>
  )

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>

  return (
    <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-orange-50 via-white to-orange-100 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-orange-700">
          🌤️ Bookings vs. Weather Trends {selectedMonth !== 'All' && `– ${selectedMonth}`}
        </h2>

        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border border-orange-300 text-orange-800 px-3 py-2 rounded-lg shadow-sm focus:outline-none"
        >
          <option value="All">All Months</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="#fed7aa" strokeDasharray="5 5" />
          <XAxis dataKey="month" stroke="#9a3412" />
          <YAxis yAxisId="left" stroke="#f97316" />
          <YAxis yAxisId="right" orientation="right" stroke="#ea580c" />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload
                return (
                  <div className="bg-white p-3 shadow rounded text-sm text-gray-800 border border-orange-200">
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
            fill="#fb923c"
            radius={[8, 8, 0, 0]}
            barSize={40}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgTemp"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ r: 4 }}
            isAnimationActive
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-6 bg-white border border-orange-200 rounded-md px-4 py-3 shadow-sm text-sm text-gray-700">
        <p className="font-semibold mb-1">💡 Monthly Insight:</p>
        <p>
          <strong>{insight.month}</strong> had {selectedMonth === 'All' ? 'the most' : 'a total of'}{' '}
          <strong>{insight.totalBookings}</strong> bookings with an average temperature of{' '}
          <strong>{insight.avgTemp}°C</strong> and mostly{' '}
          <span className="inline-flex items-center">
            <span className="text-xl mr-1">{emojiForCondition(insight.topCondition)}</span>
            <strong>{insight.topCondition}</strong>
          </span>.
        </p>
      </div>
    </div>
  )
}
