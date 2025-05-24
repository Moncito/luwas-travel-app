'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { format } from 'date-fns'

interface ItineraryBooking {
  createdAt: any
  people: number
  slug: string
}

function getMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleString('default', { month: 'long' })
}

export default function ItineraryBookingChart() {
  const [data, setData] = useState<{ date: string; bookings: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('All')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/itinerary-bookings')
        if (!res.ok) throw new Error('Failed to fetch itinerary bookings data')
        const json: ItineraryBooking[] = await res.json()

        const grouped: Record<string, number> = {}

        json.forEach(booking => {
          let dateObj: Date

          // ✅ Normalize createdAt from different Firestore/JS formats
          if (booking.createdAt?.seconds) {
            dateObj = new Date(booking.createdAt.seconds * 1000)
          } else if (typeof booking.createdAt === 'string') {
            dateObj = new Date(booking.createdAt)
          } else if (booking.createdAt?.toDate) {
            dateObj = booking.createdAt.toDate()
          } else {
            return // Skip invalid booking
          }

          const date = format(dateObj, 'yyyy-MM-dd')
          grouped[date] = (grouped[date] || 0) + (booking.people || 1)
        })

        const chartData = Object.entries(grouped)
          .map(([date, bookings]) => ({ date, bookings }))
          .sort((a, b) => a.date.localeCompare(b.date))

        setData(chartData)
      } catch (err) {
        console.error(err)
        setError('Could not load itinerary booking analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const months = useMemo(() => Array.from(new Set(data.map(d => getMonth(d.date)))), [data])

  const filteredData = useMemo(
    () =>
      selectedMonth === 'All'
        ? data
        : data.filter(d => getMonth(d.date) === selectedMonth),
    [data, selectedMonth]
  )

  const bookingStats = useMemo(() => {
    const total = filteredData.reduce((sum, d) => sum + d.bookings, 0)
    const prevData = data.filter(
      d => getMonth(d.date) !== selectedMonth && selectedMonth !== 'All'
    )
    const prevTotal = prevData.reduce((sum, d) => sum + d.bookings, 0)
    const growth = prevTotal ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0
    return { total, prevTotal, growth }
  }, [data, filteredData, selectedMonth])

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading itinerary chart...</p>
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>

  return (
    <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">📊 Itinerary Booking Trends</h2>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border border-blue-300 text-blue-900 px-3 py-1 rounded-lg shadow-sm focus:outline-none"
        >
          <option value="All">All Months</option>
          {months.map(month => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* 🆕 Summary Section */}
      <div className="bg-white border border-blue-100 rounded-md px-4 py-2 mb-4 shadow-sm text-sm text-gray-700">
        {selectedMonth !== 'All' ? (
          <p>
            In <span className="font-semibold text-blue-700">{selectedMonth}</span>, there were{" "}
            <span className="font-bold">{bookingStats.total}</span> itinerary bookings recorded. Compared to the previous period,{" "}
            {bookingStats.growth >= 0
              ? `bookings increased by ${bookingStats.growth}% 📈`
              : `bookings dropped by ${Math.abs(bookingStats.growth)}% ⚠️`}.
          </p>
        ) : (
          <p>
            This chart shows total itinerary bookings across all months. Use the dropdown filter to see performance month by month.
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={filteredData}>
          <CartesianGrid stroke="#dbeafe" strokeDasharray="5 5" />
          <XAxis dataKey="date" stroke="#1e3a8a" tick={{ fontSize: 12 }} />
          <YAxis stroke="#1e3a8a" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#eff6ff', borderRadius: 10, borderColor: '#93c5fd' }}
            labelStyle={{ color: '#1e40af' }}
            itemStyle={{ fontSize: 14 }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">📅 Bookings This Period</p>
          <p className="text-xl font-bold text-blue-700">{bookingStats.total}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">📊 Growth Compared to Prev</p>
          <p
            className={`${
              bookingStats.growth >= 0 ? 'text-blue-600' : 'text-red-600'
            } text-xl font-bold`}
          >
            {bookingStats.growth >= 0
              ? `+${bookingStats.growth}%`
              : `${bookingStats.growth}%`}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">💡 Insight</p>
          <p className="text-black font-medium">
            {bookingStats.growth > 0
              ? 'Itinerary bookings are rising 📈'
              : bookingStats.growth < 0
              ? 'Bookings slowed down this month ⚠️'
              : 'Flat growth — keep pushing 💪'}
          </p>
        </div>
      </div>
    </div>
  )
}
