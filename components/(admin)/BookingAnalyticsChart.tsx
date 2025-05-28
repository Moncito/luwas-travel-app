'use client'

import { useEffect, useState, useMemo } from 'react'
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

interface BookingData {
  date: string
  bookings: number
}

function getMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleString('default', { month: 'long' })
}

export default function BookingsAnalyticsChart() {
  const [data, setData] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('All')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/bookings')
        if (!res.ok) throw new Error('Failed to fetch bookings data')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
        setError('Could not load booking analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const months = useMemo(() => Array.from(new Set(data.map(d => getMonth(d.date)))), [data])

  const filteredData = useMemo(() =>
    selectedMonth === 'All'
      ? data
      : data.filter(d => getMonth(d.date) === selectedMonth), [data, selectedMonth]
  )

  const bookingStats = useMemo(() => {
    const total = filteredData.reduce((sum, d) => sum + d.bookings, 0)
    const prevData = data.filter(d => getMonth(d.date) !== selectedMonth && selectedMonth !== 'All')
    const prevTotal = prevData.reduce((sum, d) => sum + d.bookings, 0)
    const growth = prevTotal ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0
    return { total, prevTotal, growth }
  }, [data, filteredData, selectedMonth])

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading booking chart...</p>
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>

  return (
    <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-green-50 via-white to-green-100 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">📈 Booking Trends</h2>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border border-green-300 text-green-900 px-3 py-1 rounded-lg shadow-sm focus:outline-none"
        >
          <option value="All">All Months</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* 🆕 Text Summary Block */}
      <div className="bg-white border border-green-100 rounded-md px-4 py-2 mb-4 shadow-sm text-sm text-gray-700">
        {selectedMonth !== 'All' ? (
          <p>
            In <span className="font-semibold text-green-700">{selectedMonth}</span>, there were{" "}
            <span className="font-bold">{bookingStats.total}</span> bookings. Compared to the previous period,{" "}
            {bookingStats.growth >= 0
              ? `bookings increased by ${bookingStats.growth}% 📈`
              : `bookings dropped by ${Math.abs(bookingStats.growth)}% ⚠️`}.
          </p>
        ) : (
          <p>
            This chart displays all booking trends over time. Use the filter above to explore changes month by month and identify growth patterns.
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={filteredData}>
          <CartesianGrid stroke="#d1fae5" strokeDasharray="5 5" />
          <XAxis dataKey="date" stroke="#065f46" tick={{ fontSize: 12 }} />
          <YAxis stroke="#065f46" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ecfdf5', borderRadius: 10, borderColor: '#6ee7b7' }}
            labelStyle={{ color: '#064e3b' }}
            itemStyle={{ fontSize: 14 }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Growth Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">📅 Bookings This Period</p>
          <p className="text-xl font-bold text-green-700">{bookingStats.total}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">📊 Growth Compared to Prev</p>
          <p className={`${bookingStats.growth >= 0 ? 'text-green-600' : 'text-red-600'} text-xl font-bold`}>
            {bookingStats.growth >= 0 ? `+${bookingStats.growth}%` : `${bookingStats.growth}%`}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">💡 Insight</p>
          <p className="text-black font-medium">
            {bookingStats.growth > 0
              ? 'Bookings are trending upward 📈'
              : bookingStats.growth < 0
              ? 'Bookings slowed down this month ⚠️'
              : 'Flat growth — keep pushing 💪'}
          </p>
        </div>
      </div>
    </div>
  )
}
