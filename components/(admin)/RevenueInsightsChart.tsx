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
import { motion } from 'framer-motion'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface MonthlyRevenue {
  month: string
  Destinations: number
  Itineraries: number
  Promos: number
  Total: number
  Count: Record<string, number>
}

export default function RevenueInsightsChart() {
  const [data, setData] = useState<MonthlyRevenue[]>([])
  const [growth, setGrowth] = useState<number>(0)
  const [selectedMonth, setSelectedMonth] = useState<string>('Latest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/revenue')
        if (!res.ok) throw new Error('Failed to fetch revenue analytics')
        const json = await res.json()
        setData(json.monthly)
        setGrowth(json.growth)
      } catch (err) {
        console.error(err)
        setError('Could not load revenue data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`
  const months = useMemo(() => data.map((d) => d.month), [data])
  const selected =
    selectedMonth === 'Latest' ? data[data.length - 1] : data.find((m) => m.month === selectedMonth)

  const descText = selected
    ? `In ${selected.month}, there were ${selected.Count.Destinations || 0} successful destination payments earning ${peso(
        selected.Destinations
      )}, ${selected.Count.Itineraries || 0} itinerary payments earning ${peso(
        selected.Itineraries
      )}, and ${selected.Count.Promos || 0} promo payments earning ${peso(
        selected.Promos
      )}. Total revenue reached ${peso(selected.Total)} — ${
        growth >= 0
          ? `${growth.toFixed(1)}% higher than last month.`
          : `${Math.abs(growth).toFixed(1)}% lower than last month.`
      }`
    : 'Revenue analytics data is loading...'

  if (loading)
    return <p className="text-center text-gray-600 mt-10">Loading revenue insights...</p>
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: 'Destinations',
        data: data.map((d) => d.Destinations),
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
      },
      {
        label: 'Itineraries',
        data: data.map((d) => d.Itineraries),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Promos',
        data: data.map((d) => d.Promos),
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val: number) => `₱${(val / 1000).toFixed(0)}k`,
        },
      },
    },
  }

  return (
    <motion.div
      className="p-6 rounded-xl bg-gradient-to-br from-blue-50 via-white to-green-50 shadow border"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-700">Revenue Insights</h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 shadow-sm"
        >
          <option value="Latest">Latest Month</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Descriptive Summary */}
      <motion.div
        className="bg-white border border-blue-100 rounded-md px-3 py-3 mb-5 text-gray-700 text-sm shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {descText}
      </motion.div>

      {/* Chart */}
      <motion.div
        className="w-full h-[300px] bg-white rounded-lg p-3 shadow-sm mb-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Bar data={chartData} options={chartOptions} />
      </motion.div>

      {/* Summary Cards */}
      {selected && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          <AnimatedSummaryCard title="Destinations Total" value={peso(selected.Destinations)} />
          <AnimatedSummaryCard title="Itineraries Total" value={peso(selected.Itineraries)} />
          <AnimatedSummaryCard title="Promos Total" value={peso(selected.Promos)} />
          <AnimatedSummaryCard
            title="Overall Total"
            value={peso(selected.Total)}
            highlight
          />
        </motion.div>
      )}
    </motion.div>
  )
}

/* ----------------- Animated Summary Card ----------------- */
function AnimatedSummaryCard({
  title,
  value,
  highlight,
}: {
  title: string
  value: string
  highlight?: boolean
}) {
  return (
    <motion.div
      className={`p-4 bg-white rounded-lg shadow-sm border ${
        highlight ? 'border-blue-400 bg-blue-50' : ''
      } cursor-pointer`}
      whileHover={{ scale: 1.03, boxShadow: '0px 4px 12px rgba(0,0,0,0.1)' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-xs text-gray-500">{title}</p>
      <motion.p
        key={value}
        className="text-lg font-semibold text-gray-800"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {value}
      </motion.p>
    </motion.div>
  )
}
