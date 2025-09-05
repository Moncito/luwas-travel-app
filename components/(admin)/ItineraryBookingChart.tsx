'use client'

import { useEffect, useState, useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { CheckCircle, XCircle, Clock, ListChecks } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend)

interface ItineraryBooking {
  status?: 'upcoming' | 'completed' | 'cancelled' | 'paid' | 'waiting_payment'
  createdAt: string | { seconds: number }
}

function getMonth(raw: ItineraryBooking['createdAt']): string {
  try {
    if (typeof raw === 'string') {
      return new Date(raw).toLocaleString('default', { month: 'long' })
    }
    if (typeof raw === 'object' && 'seconds' in raw) {
      return new Date(raw.seconds * 1000).toLocaleString('default', { month: 'long' })
    }
    return new Date(raw as string).toLocaleString('default', { month: 'long' })
  } catch {
    return 'Unknown'
  }
}

export default function ItineraryBookingChart() {
  const [data, setData] = useState<ItineraryBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>('All')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/itinerary-bookings')
        if (!res.ok) throw new Error('Failed to fetch itinerary bookings')
        const json: ItineraryBooking[] = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
        setError('Could not load itinerary bookings')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const months = useMemo(
    () => Array.from(new Set(data.map(d => getMonth(d.createdAt)))),
    [data]
  )

  const filteredData = useMemo(
    () =>
      selectedMonth === 'All'
        ? data
        : data.filter(d => getMonth(d.createdAt) === selectedMonth),
    [data, selectedMonth]
  )

  const bookingStats = useMemo(() => {
    const confirmed = filteredData.filter(
      d => d.status === 'paid' || d.status === 'completed'
    ).length
    const cancelled = filteredData.filter(d => d.status === 'cancelled').length
    const pending = filteredData.filter(
      d => d.status === 'upcoming' || d.status === 'waiting_payment'
    ).length
    const total = confirmed + cancelled + pending

    const prevData =
      selectedMonth === 'All'
        ? []
        : data.filter(d => getMonth(d.createdAt) !== selectedMonth)
    const prevTotal = prevData.length
    const growth = prevTotal
      ? Math.round(((total - prevTotal) / prevTotal) * 100)
      : 0

    return { confirmed, cancelled, pending, total, growth }
  }, [filteredData, data, selectedMonth])

  if (loading) return <p className="text-center text-gray-600 mt-10">Loading itinerary analytics...</p>
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>

  const chartData = {
    labels: ['Confirmed', 'Cancelled', 'Pending'],
    datasets: [
      {
        data: [bookingStats.confirmed, bookingStats.cancelled, bookingStats.pending],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderColor: ['#ffffff'],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { label: string; raw: number }) => {
            const label = context.label
            const value = context.raw
            const percentage = bookingStats.total
              ? ((value / bookingStats.total) * 100).toFixed(1)
              : '0'
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  const Card = ({
    title,
    value,
    color,
    icon: Icon,
    percentage,
  }: {
    title: string
    value: number
    color: string
    icon: React.ComponentType<{ className?: string }>
    percentage?: number
  }) => (
    <div className="p-4 rounded-lg shadow-sm border bg-white flex flex-col gap-2">
      <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm">
        <Icon className={`w-4 h-4 ${color}`} />
        {title}
      </div>
      <p className={`text-xl font-bold ${color}`}>
        {value} {percentage !== undefined && `(${percentage.toFixed(1)}%)`}
      </p>
      {percentage !== undefined && (
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              color === 'text-green-600'
                ? 'bg-green-500'
                : color === 'text-red-600'
                ? 'bg-red-500'
                : color === 'text-yellow-600'
                ? 'bg-yellow-500'
                : 'bg-purple-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-purple-50 via-white to-purple-100 shadow-lg">
      {/* Header + Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-800">Itinerary Bookings Overview</h2>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="border border-purple-300 text-purple-900 px-3 py-1 rounded-lg shadow-sm focus:outline-none"
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
      <div className="bg-white border border-purple-100 rounded-md px-4 py-2 mb-6 shadow-sm text-sm text-gray-700">
        {selectedMonth !== 'All' ? (
          <p>
            In <span className="font-semibold text-purple-700">{selectedMonth}</span>, there were{' '}
            <span className="font-bold">{bookingStats.total}</span> itinerary bookings (
            <span className="text-green-600">{bookingStats.confirmed} confirmed</span>,{' '}
            <span className="text-red-600">{bookingStats.cancelled} cancelled</span>,{' '}
            <span className="text-yellow-600">{bookingStats.pending} pending</span>). Compared to
            the previous period,{' '}
            {bookingStats.growth >= 0
              ? `bookings increased by ${bookingStats.growth}%`
              : `bookings decreased by ${Math.abs(bookingStats.growth)}%`}.
          </p>
        ) : (
          <p>
            This donut chart shows the distribution of itinerary bookings across statuses. Use the
            month filter for detailed breakdowns.
          </p>
        )}
      </div>

      {/* Donut Chart */}
      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl font-bold text-purple-800">{bookingStats.total} Total</p>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card title="Total" value={bookingStats.total} color="text-purple-600" icon={ListChecks} />
        <Card
          title="Confirmed"
          value={bookingStats.confirmed}
          color="text-green-600"
          icon={CheckCircle}
          percentage={(bookingStats.confirmed / bookingStats.total) * 100 || 0}
        />
        <Card
          title="Cancelled"
          value={bookingStats.cancelled}
          color="text-red-600"
          icon={XCircle}
          percentage={(bookingStats.cancelled / bookingStats.total) * 100 || 0}
        />
        <Card
          title="Pending"
          value={bookingStats.pending}
          color="text-yellow-600"
          icon={Clock}
          percentage={(bookingStats.pending / bookingStats.total) * 100 || 0}
        />
      </div>
    </div>
  )
}
