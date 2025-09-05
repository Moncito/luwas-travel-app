'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

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

  const filteredData = useMemo(
    () => (selectedMonth === 'All'
      ? chartData
      : chartData.filter(d => getMonth(d.date) === selectedMonth)),
    [chartData, selectedMonth]
  )

  const growthStats = useMemo(() => {
    const totalUsers = filteredData.reduce((sum, d) => sum + d.totalUsers, 0)
    const totalTrips = filteredData.reduce((sum, d) => sum + d.totalTrips, 0)

    const prevMonthData = chartData.filter(
      d => getMonth(d.date) !== selectedMonth && selectedMonth !== 'All'
    )
    const prevUsers = prevMonthData.reduce((sum, d) => sum + d.totalUsers, 0)
    const prevTrips = prevMonthData.reduce((sum, d) => sum + d.totalTrips, 0)

    const userGrowth = prevUsers ? Math.round(((totalUsers - prevUsers) / prevUsers) * 100) : 0
    const tripGrowth = prevTrips ? Math.round(((totalTrips - prevTrips) / prevTrips) * 100) : 0

    return { totalUsers, totalTrips, userGrowth, tripGrowth }
  }, [filteredData, chartData, selectedMonth])

  if (loading) {
    return (
      <div className="text-center mt-10">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-300 border-t-transparent rounded-full"></div>
        <p className="text-gray-500 mt-2">Loading analytics chart...</p>
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>
  }

  // Chart.js dataset setup
  const data = {
    labels: filteredData.map(d => d.date),
    datasets: [
      {
        label: 'Total Users',
        data: filteredData.map(d => d.totalUsers),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 3.5,
        pointBackgroundColor: '#2563eb',
      },
      {
        label: 'Total Trips',
        data: filteredData.map(d => d.totalTrips),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.15)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 3.5,
        pointBackgroundColor: '#059669',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, family: 'Inter, sans-serif' },
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderWidth: 1,
        borderColor: '#334155',
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: '#475569', font: { size: 12 } },
        grid: { color: '#e2e8f0' },
      },
      y: {
        ticks: { color: '#475569', font: { size: 12 } },
        grid: { color: '#e2e8f0' },
      },
    },
  }

  return (
    <div className="mt-10 p-8 rounded-xl bg-white shadow-md border border-gray-100">
      {/* Header + Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">User & Trip Trends</h2>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border border-gray-300 text-gray-800 px-3 py-1.5 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="All">All Months</option>
          {months.map(month => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Descriptive Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-md px-4 py-3 mb-5 text-sm text-gray-700">
        {selectedMonth !== 'All' ? (
          <p>
            In <span className="font-semibold text-gray-900">{selectedMonth}</span>, there were{' '}
            <span className="font-bold">{growthStats.totalUsers}</span> new users and{' '}
            <span className="font-bold">{growthStats.totalTrips}</span> trips booked. Compared to the previous month,{' '}
            {growthStats.userGrowth >= 0
              ? `user signups grew by ${growthStats.userGrowth}%`
              : `user signups dropped by ${Math.abs(growthStats.userGrowth)}%`}, and{' '}
            {growthStats.tripGrowth >= 0
              ? `trip bookings increased by ${growthStats.tripGrowth}%`
              : `trip bookings decreased by ${Math.abs(growthStats.tripGrowth)}%`}.
          </p>
        ) : (
          <p>
            This chart shows the overall trend of users and trips across all months. Use the filter above to drill
            down by month and gain detailed insights.
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-[350px]">
        <Line data={data} options={options} />
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 font-medium">User Growth</p>
          <p className={`${growthStats.userGrowth >= 0 ? 'text-green-600' : 'text-red-600'} text-xl font-bold`}>
            {growthStats.userGrowth >= 0 ? `+${growthStats.userGrowth}%` : `${growthStats.userGrowth}%`}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 font-medium">Trip Growth</p>
          <p className={`${growthStats.tripGrowth >= 0 ? 'text-green-600' : 'text-red-600'} text-xl font-bold`}>
            {growthStats.tripGrowth >= 0 ? `+${growthStats.tripGrowth}%` : `${growthStats.tripGrowth}%`}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 font-medium">Insight</p>
          <p className="text-gray-900 font-semibold">
            {growthStats.userGrowth > growthStats.tripGrowth
              ? 'Users are growing faster'
              : growthStats.tripGrowth > growthStats.userGrowth
              ? 'Trips are rising faster'
              : 'Performance is steady'}
          </p>
        </div>
      </div>
    </div>
  )
}
