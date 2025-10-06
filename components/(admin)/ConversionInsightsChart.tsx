'use client'

import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { motion } from 'framer-motion'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface ModuleRate {
  total: number
  success: number
  rate: number
}
interface ConversionData {
  modules: {
    Destinations: ModuleRate
    Itineraries: ModuleRate
    Promos: ModuleRate
  }
  overall: number
  insights: string
  topModule: string
}

export default function ConversionInsightsChart() {
  const [data, setData] = useState<ConversionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/analytics/conversion')
        if (!res.ok) throw new Error('Failed to fetch conversion analytics')
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
        setError('Could not load conversion data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading)
    return <p className="text-center text-gray-600 mt-10">Loading conversion insights...</p>
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>
  if (!data) return null

  const chartData = {
    labels: ['Destinations', 'Itineraries', 'Promos'],
    datasets: [
      {
        label: 'Conversion Rate (%)',
        data: [
          data.modules.Destinations.rate,
          data.modules.Itineraries.rate,
          data.modules.Promos.rate,
        ],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)', // blue
          'rgba(34, 197, 94, 0.8)', // green
          'rgba(234, 179, 8, 0.8)', // yellow
        ],
        borderRadius: 8,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.parsed.y.toFixed(1)}% conversion`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (val: number) => `${val}%` },
      },
    },
  }

  return (
    <motion.div
      className="p-6 rounded-xl bg-gradient-to-br from-green-50 via-white to-blue-50 shadow border"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-xl font-semibold text-green-700 mb-4">Conversion Insights</h2>

      {/* Descriptive Analytics Summary */}
      <motion.div
        className="bg-white border border-green-100 rounded-md px-4 py-3 mb-5 shadow-sm text-sm text-gray-700 leading-relaxed"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p dangerouslySetInnerHTML={{ __html: data.insights.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      </motion.div>

      {/* Chart */}
      <motion.div
        className="w-full h-[300px] bg-white rounded-lg p-4 shadow-sm mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Bar data={chartData} options={chartOptions} />
      </motion.div>

      {/* Highlight Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        {[
          { title: 'Destinations', rate: data.modules.Destinations.rate, color: 'text-blue-600' },
          { title: 'Itineraries', rate: data.modules.Itineraries.rate, color: 'text-green-600' },
          { title: 'Promos', rate: data.modules.Promos.rate, color: 'text-yellow-600' },
          { title: 'Overall', rate: data.overall, color: 'text-purple-600' },
        ].map((item) => (
          <motion.div
            key={item.title}
            className={`p-4 bg-white rounded-lg shadow-sm border flex flex-col items-center justify-center ${
              item.title === data.topModule ? 'ring-2 ring-green-400' : ''
            }`}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-sm font-semibold text-gray-600">{item.title}</p>
            <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.rate.toFixed(1)}%</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
