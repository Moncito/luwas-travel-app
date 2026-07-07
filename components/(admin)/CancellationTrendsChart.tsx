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
  ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { motion } from 'framer-motion'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface MonthlyCancellation {
  month: string
  total: number
  plans_changed: number
  financial: number
  emergency: number
  better_option: number
  quality: number
  other: number
  cancellationRate: number
}

export default function CancellationTrendsChart() {
  const [data, setData] = useState<MonthlyCancellation[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('Latest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRealData, setIsRealData] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('[CancellationTrends] Starting fetch from /api/analytics/cancellations...')
        const res = await fetch('/api/analytics/cancellations')
        console.log(`[CancellationTrends] API Response Status: ${res.status}`)
        
        if (!res.ok) {
          const errorData = await res.json()
          const errorMsg = errorData.details || errorData.error || 'Failed to fetch cancellation analytics'
          console.error(`[CancellationTrends] API Error: ${errorMsg}`)
          throw new Error(errorMsg)
        }
        
        const json = await res.json()
        console.log('[CancellationTrends] API Data Received:', json)
        
        if (json.monthly && Array.isArray(json.monthly)) {
          console.log(`[CancellationTrends] Successfully loaded ${json.monthly.length} months of real data`)
          setData(json.monthly)
          setIsRealData(true)
        } else {
          console.error('[CancellationTrends] Invalid data format:', json)
          throw new Error('Invalid data format received')
        }
      } catch (err) {
        console.error('[CancellationTrends] Error fetching cancellation data:', err)
        const message = err instanceof Error ? err.message : 'Could not load cancellation data'
        setError(message)
        // Fallback to mock data
        console.warn('[CancellationTrends] Falling back to mock data')
        setData(getMockData())
        setIsRealData(false)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const months = useMemo(() => data.map((d) => d.month), [data])
  const selected =
    selectedMonth === 'Latest' ? data[data.length - 1] : data.find((m) => m.month === selectedMonth)

  const getMostCommonReason = (m: MonthlyCancellation) => {
    const reasons: Record<string, number> = {
      'My plans have changed': m.plans_changed,
      'Financial reasons': m.financial,
      'Health/Family emergency': m.emergency,
      'Found a better alternative': m.better_option,
      'Service quality concerns': m.quality,
      'Other': m.other,
    }
    const sorted = Object.entries(reasons).sort(([, a], [, b]) => b - a)
    return sorted[0]?.[0] || 'N/A'
  }

  const descText = selected
    ? `In ${selected.month}, there were ${selected.total} total cancellations (${selected.cancellationRate.toFixed(1)}% cancellation rate). Top reason: "${getMostCommonReason(selected)}". Breakdown: ${selected.plans_changed} plan changes, ${selected.financial} financial, ${selected.emergency} emergencies, ${selected.better_option} better options, ${selected.quality} quality concerns, ${selected.other} other.`
    : 'Cancellation analytics data is loading...'

  if (loading)
    return <p className="text-center text-gray-600 mt-10">Loading cancellation insights...</p>
  
  if (error && data.length === 0)
    return (
      <div className="text-center text-red-600 mt-10 p-4 bg-red-50 rounded-lg border-2 border-red-300">
        <p className="font-semibold">❌ API Error:</p>
        <p className="text-sm mt-1">{error}</p>
        <p className="text-xs text-gray-500 mt-3 bg-yellow-50 p-2 rounded border border-yellow-200">
          Showing mock data for development while API is unavailable
        </p>
      </div>
    )

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: 'Total Cancellations',
        data: data.map((d) => d.total),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 7,
      },
      {
        label: 'Cancellation Rate (%)',
        data: data.map((d) => d.cancellationRate),
        borderColor: 'rgba(251, 146, 60, 1)',
        backgroundColor: 'rgba(251, 146, 60, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgba(251, 146, 60, 1)',
        yAxisID: 'y1',
      },
    ],
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: {
      y: {
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (val: string | number) => {
            if (typeof val === 'number') return `${val}%`
            return val
          },
        },
      },
    },
  } as ChartOptions<'line'>

  return (
    <motion.div
      className="p-6 rounded-xl bg-gradient-to-br from-red-50 via-white to-orange-50 shadow border"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-red-700">Cancellation Trends</h2>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isRealData 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
          }`}>
            {isRealData ? '✓ Real Data' : '⚠ Fallback Data'}
          </span>
          {error && <span className="text-xs text-red-600 font-semibold">API Error</span>}
        </div>
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
        className="bg-white border border-red-100 rounded-md px-3 py-3 mb-5 text-gray-700 text-sm shadow-sm"
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
        <Line data={chartData} options={chartOptions} />
      </motion.div>

      {/* Summary Cards */}
      {selected && (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          <AnimatedSummaryCard title="Total Cancellations" value={selected.total.toString()} />
          <AnimatedSummaryCard 
            title="Cancellation Rate" 
            value={`${selected.cancellationRate.toFixed(1)}%`}
            highlight
          />
          <AnimatedSummaryCard 
            title="Plans Changed" 
            value={selected.plans_changed.toString()}
            color="blue"
          />
          <AnimatedSummaryCard 
            title="Financial Issues" 
            value={selected.financial.toString()}
            color="orange"
          />
          <AnimatedSummaryCard 
            title="Other Reasons" 
            value={(selected.emergency + selected.better_option + selected.quality + selected.other).toString()}
            color="purple"
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
  color,
}: {
  title: string
  value: string
  highlight?: boolean
  color?: 'blue' | 'orange' | 'purple'
}) {
  const colorClass = {
    blue: 'border-blue-400 bg-blue-50',
    orange: 'border-orange-400 bg-orange-50',
    purple: 'border-purple-400 bg-purple-50',
  }[color || 'blue'] || ''

  const highlightClass = highlight ? 'border-red-400 bg-red-50' : colorClass

  return (
    <motion.div
      className={`p-4 bg-white rounded-lg shadow-sm border ${highlightClass} cursor-pointer`}
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

/* Mock data for development */
function getMockData(): MonthlyCancellation[] {
  return [
    {
      month: 'Jan 26',
      total: 5,
      plans_changed: 2,
      financial: 1,
      emergency: 1,
      better_option: 0,
      quality: 1,
      other: 0,
      cancellationRate: 8.3,
    },
    {
      month: 'Feb 26',
      total: 8,
      plans_changed: 3,
      financial: 2,
      emergency: 1,
      better_option: 1,
      quality: 1,
      other: 0,
      cancellationRate: 12.5,
    },
    {
      month: 'Mar 26',
      total: 6,
      plans_changed: 2,
      financial: 1,
      emergency: 1,
      better_option: 1,
      quality: 1,
      other: 0,
      cancellationRate: 9.2,
    },
    {
      month: 'Apr 26',
      total: 12,
      plans_changed: 5,
      financial: 3,
      emergency: 2,
      better_option: 1,
      quality: 1,
      other: 0,
      cancellationRate: 15.8,
    },
    {
      month: 'May 26',
      total: 9,
      plans_changed: 4,
      financial: 2,
      emergency: 1,
      better_option: 1,
      quality: 1,
      other: 0,
      cancellationRate: 11.3,
    },
    {
      month: 'Jun 26',
      total: 7,
      plans_changed: 3,
      financial: 1,
      emergency: 1,
      better_option: 1,
      quality: 1,
      other: 0,
      cancellationRate: 9.6,
    },
  ]
}
