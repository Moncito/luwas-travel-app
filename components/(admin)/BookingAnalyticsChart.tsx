// components/(admin)/BookingAnalyticsChart.tsx
'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Booking } from '@/types/booking'

const COLORS = ['#00B5D8', '#38A169', '#ED8936']

export default function BookingAnalyticsChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/bookings')
        const bookings: Booking[] = await res.json()

        const statusCounts: Record<string, number> = {
          upcoming: 0,
          completed: 0,
          cancelled: 0,
        }

        bookings.forEach((b) => {
          const status = b.status.toLowerCase()
          if (statusCounts[status] !== undefined) {
            statusCounts[status]++
          }
        })

        const chartData = Object.entries(statusCounts).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count,
        }))

        setData(chartData)
      } catch (err) {
        console.error('Error fetching bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p>Loading Chart...</p>

  return (
    <div className="bg-white p-4 rounded shadow w-full max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-4">Booking Status Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
