'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface PromoBookingData {
  date: string
  paid: number
  cancelled?: number
  pending?: number
}

function getMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleString('default', { month: 'long' })
}

export default function PromoBookingsAnalyticsChart() {
  const [data, setData] = useState<PromoBookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('All')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/promos')
        if (!res.ok) throw new Error('Failed to fetch promo bookings data')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
        setError('Could not load promo booking analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const months = useMemo(
    () => Array.from(new Set(data.map((d) => getMonth(d.date)))),
    [data]
  )

  const filteredData = useMemo(
    () =>
      selectedMonth === 'All'
        ? data
        : data.filter((d) => getMonth(d.date) === selectedMonth),
    [data, selectedMonth]
  )

  const bookingStats = useMemo(() => {
    const totalPaid = filteredData.reduce((sum, d) => sum + (d.paid || 0), 0)
    const totalCancelled = filteredData.reduce((sum, d) => sum + (d.cancelled || 0), 0)
    const totalPending = filteredData.reduce((sum, d) => sum + (d.pending || 0), 0)
    const total = totalPaid + totalCancelled + totalPending

    const prevData =
      selectedMonth === 'All'
        ? []
        : data.filter((d) => getMonth(d.date) !== selectedMonth)

    const prevTotal = prevData.reduce(
      (sum, d) => sum + (d.paid || 0) + (d.cancelled || 0) + (d.pending || 0),
      0
    )

    const growth = prevTotal
      ? Math.round(((total - prevTotal) / prevTotal) * 100)
      : 0

    return { total, totalPaid, totalCancelled, totalPending, growth }
  }, [data, filteredData, selectedMonth])

  if (loading)
    return (
      <p className="text-center text-gray-600 mt-10">
        Loading promo booking chart...
      </p>
    )
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>

  // Chart.js config
  const chartData = {
    labels: filteredData.map((d) =>
      new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    ),
    datasets: [
      {
        label: 'Paid',
        data: filteredData.map((d) => d.paid),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
        stack: 'promos',
        borderRadius: 6,
      },
      {
        label: 'Cancelled',
        data: filteredData.map((d) => d.cancelled ?? 0),
        backgroundColor: 'rgba(239, 68, 68, 0.8)', // red-500
        stack: 'promos',
        borderRadius: 6,
      },
      {
        label: 'Pending',
        data: filteredData.map((d) => d.pending ?? 0),
        backgroundColor: 'rgba(249, 115, 22, 0.8)', // orange-500
        stack: 'promos',
        borderRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { stacked: true, grid: { color: '#fef2f2' } },
      y: { stacked: true, beginAtZero: true, grid: { color: '#fee2e2' } },
    },
  }

  const getPercentage = (value: number) =>
    bookingStats.total ? ((value / bookingStats.total) * 100).toFixed(1) : '0.0'

  return (
    <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-orange-50 via-white to-red-50 shadow-lg">
      {/* Header + Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-800">
          Promo Booking Trends
        </h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-orange-300 text-orange-900 px-3 py-1 rounded-lg shadow-sm focus:outline-none"
        >
          <option value="All">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Descriptive Summary */}
      <div className="bg-white border border-orange-100 rounded-md px-4 py-2 mb-4 shadow-sm text-sm text-gray-700">
        {selectedMonth !== 'All' ? (
          <p>
            In{' '}
            <span className="font-semibold text-orange-700">
              {selectedMonth}
            </span>
            , there were{' '}
            <span className="font-bold">{bookingStats.total}</span> total promo
            bookings (
            <span className="text-blue-600">{bookingStats.totalPaid} paid</span>
            ,{' '}
            <span className="text-red-600">
              {bookingStats.totalCancelled} cancelled
            </span>
            ,{' '}
            <span className="text-orange-600">
              {bookingStats.totalPending} pending
            </span>
            ). Compared to the previous period,{' '}
            {bookingStats.growth >= 0
              ? `bookings increased by ${bookingStats.growth}%`
              : `bookings decreased by ${Math.abs(bookingStats.growth)}%`}
            .
          </p>
        ) : (
          <p>
            This chart displays promo booking trends over time, stacked by
            status. Use the month filter above to explore changes and identify
            growth patterns.
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="w-full h-[350px] bg-white rounded-lg p-4 shadow">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Growth Summary Cards with Progress Bars */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-700">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">Total Promo Bookings</p>
          <p className="text-xl font-bold text-orange-700">
            {bookingStats.total}
          </p>
        </div>

        {/* Paid */}
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">Paid</p>
          <p className="text-lg font-bold text-blue-600">
            {bookingStats.totalPaid} ({getPercentage(bookingStats.totalPaid)}%)
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${getPercentage(bookingStats.totalPaid)}%` }}
            ></div>
          </div>
        </div>

        {/* Cancelled */}
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">Cancelled</p>
          <p className="text-lg font-bold text-red-600">
            {bookingStats.totalCancelled} (
            {getPercentage(bookingStats.totalCancelled)}%)
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{ width: `${getPercentage(bookingStats.totalCancelled)}%` }}
            ></div>
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">Pending</p>
          <p className="text-lg font-bold text-orange-600">
            {bookingStats.totalPending} (
            {getPercentage(bookingStats.totalPending)}%)
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className="bg-orange-500 h-2 rounded-full"
              style={{ width: `${getPercentage(bookingStats.totalPending)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
