'use client'

import { useEffect, useMemo, useState } from 'react'
import { db } from '@/firebase/client'
import {
  collection,
  query, // ✅ Kept for future use
  onSnapshot,
  getDocs,
  where, // ✅ Kept for future use
} from 'firebase/firestore'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = {
  positive: '#34d399',
  neutral: '#facc15',
  negative: '#f87171',
}

type Destination = {
  id: string
  name: string
}

export default function SentimentStats() {
  const [selectedDestination, setSelectedDestination] = useState<string>('All')
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Fetch destinations for dropdown
  useEffect(() => {
    async function fetchDestinations() {
      const snapshot = await getDocs(collection(db, 'destinations'))
      const names: Destination[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || doc.id,
      }))
      setDestinations(names)
    }
    fetchDestinations()
  }, [])

  // ✅ Real-time reviews fetching
  useEffect(() => {
    const q = collection(db, 'reviews')
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => doc.data())
      setReviews(fetched)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const filteredReviews = useMemo(() => {
    return selectedDestination === 'All'
      ? reviews
      : reviews.filter((r) => r.destinationId === selectedDestination)
  }, [reviews, selectedDestination])

  const sentimentCounts = useMemo(() => {
    return {
      positive: filteredReviews.filter((r) => r.sentiment === 'positive').length,
      neutral: filteredReviews.filter((r) => r.sentiment === 'neutral').length,
      negative: filteredReviews.filter((r) => r.sentiment === 'negative').length,
    }
  }, [filteredReviews])

  const total = Object.values(sentimentCounts).reduce((sum, val) => sum + val, 0)
  const positiveRatio = total ? sentimentCounts.positive / total : 0
  const negativeRatio = total ? sentimentCounts.negative / total : 0

  const insight =
    positiveRatio > 0.7
      ? 'Users love this destination 🏖️'
      : negativeRatio > 0.4
      ? 'High dissatisfaction — check tour quality ⚠️'
      : 'Mixed reviews — room for improvement 🤔'

  const chartData = [
    { name: 'Positive', value: sentimentCounts.positive },
    { name: 'Neutral', value: sentimentCounts.neutral },
    { name: 'Negative', value: sentimentCounts.negative },
  ]

  if (loading) return <p className="text-center mt-10">Loading sentiment data...</p>

  return (
    <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-blue-50 via-white to-blue-100 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-800">🧠 Review Sentiment Analysis</h2>
        <select
          value={selectedDestination}
          onChange={(e) => setSelectedDestination(e.target.value)}
          className="border border-blue-300 text-blue-900 px-3 py-1 rounded-lg shadow-sm focus:outline-none"
        >
          <option value="All">All Destinations</option>
          {destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[entry.name.toLowerCase() as keyof typeof COLORS]
                }
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">📦 Total Reviews</p>
          <p className="text-xl font-bold text-blue-700">{total}</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">💚 % Positive</p>
          <p className="text-xl font-bold text-green-600">
            {Math.round(positiveRatio * 100)}%
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-sm border">
          <p className="font-semibold text-gray-600">🧠 Insight</p>
          <p className="text-black font-medium">{insight}</p>
        </div>
      </div>
    </div>
  )
}
