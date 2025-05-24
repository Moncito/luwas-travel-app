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

interface DailyDataPoint {
  date: string
  totalUsers: number
  totalTrips: number
}

function getMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleString('default', { month: 'long' })
}

export default function UserTripCharts() {
  const [chartData, setChartData] = useState<DailyDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('All')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/daily')
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        if (!Array.isArray(data)) throw new Error('Invalid data format')
        setChartData(data)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
        setError('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const months = useMemo(() => Array.from(new Set(chartData.map(d => getMonth(d.date)))), [chartData])

  const filteredData = useMemo(() => selectedMonth === 'All'
    ? chartData
    : chartData.filter(d => getMonth(d.date) === selectedMonth), [chartData, selectedMonth])

  const growthStats = useMemo(() => {
    const totalUsers = filteredData.reduce((sum, d) => sum + d.totalUsers, 0)
    const totalTrips = filteredData.reduce((sum, d) => sum + d.totalTrips, 0)
    const prevMonthData = chartData.filter(d =>
      getMonth(d.date) !== selectedMonth && selectedMonth !== 'All'
    )
    const prevUsers = prevMonthData.reduce((sum, d) => sum + d.totalUsers, 0)
    const prevTrips = prevMonthData.reduce((sum, d) => sum + d.totalTrips, 0)
    const userGrowth = prevUsers ? Math.round(((totalUsers - prevUsers) / prevUsers) * 100) : 0
    const tripGrowth = prevTrips ? Math.round(((totalTrips - prevTrips) / prevTrips) * 100) : 0
    return { userGrowth, tripGrowth }
  }, [filteredData, chartData, selectedMonth])

  if (loading) {
    return (
      <div className="text-center mt-10">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-gray-600"></div>
        <p className="text-gray-500 mt-2">Loading analytics chart...</p>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>
  }

  return (
    <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">📊 User & Trip Trends</h2>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border border-blue-300 text-blue-900 px-3 py-1 rounded-lg shadow-sm focus:outline-none"
        >
          <option value="All">All Months</option>
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>

      {/* 🆕 Text Summary */}
      <div className="bg-white border border-blue-100 rounded-md px-4 py-2 mb-4 shadow-sm text-sm text-gray-700">
        {selectedMonth !== 'All' ? (
          <p>
            In <span className="font-semibold text-blue-700">{selectedMonth}</span>, there were{" "}
            <span className="font-bold">{filteredData.reduce((sum, d) => sum + d.totalUsers, 0)}</span> new users and{" "}
            <span className="font-bold">{filteredData.reduce((sum, d) => sum + d.totalTrips, 0)}</span> trips booked. Compared to the previous month,{" "}
            {growthStats.userGrowth >= 0
              ? `user signups grew by ${growthStats.userGrowth}%`
              : `user signups dropped by ${Math.abs(growthStats.userGrowth)}%`}, and{" "}
            {growthStats.tripGrowth >= 0
              ? `trip bookings increased by ${growthStats.tripGrowth}%`
              : `trip bookings decreased by ${Math.abs(growthStats.tripGrowth)}%`}.
          </p>
        ) : (
          <p>
            This chart shows the overall trend of users and trips across all months. Use the filter above to drill down by month and gain detailed insights.
          </p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={filteredData}>
          <CartesianGrid stroke="#e0f2fe" strokeDasharray="5 5" />
          <XAxis dataKey="date" stroke="#1e3a8a" tick={{ fontSize: 12 }} />
          <YAxis stroke="#1e3a8a" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#f0f9ff', borderRadius: 10, borderColor: '#bae6fd' }}
            labelStyle={{ color: '#0c4a6e' }}
            itemStyle={{ fontSize: 14 }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line type="monotone" dataKey="totalUsers" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="totalTrips" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">📈 User Growth</p>
          <p className={`${growthStats.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'} text-xl font-bold`}>
            {growthStats.userGrowth >= 0 ? `+${growthStats.userGrowth}%` : `${growthStats.userGrowth}%`}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">📈 Trip Growth</p>
          <p className={`${growthStats.tripGrowth >= 0 ? 'text-green-600' : 'text-red-600'} text-xl font-bold`}>
            {growthStats.tripGrowth >= 0 ? `+${growthStats.tripGrowth}%` : `${growthStats.tripGrowth}%`}
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">🔥 Top Insight</p>
          <p className="text-black font-medium">
            {growthStats.userGrowth > growthStats.tripGrowth
              ? 'Users are growing faster 📈'
              : growthStats.tripGrowth > growthStats.userGrowth
              ? 'Trips are rising fast 🧳'
              : 'Steady performance 👍'}
          </p>
        </div>
      </div>
    </div>
  )
}
