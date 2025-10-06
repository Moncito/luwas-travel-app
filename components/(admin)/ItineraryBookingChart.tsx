"use client"

import { useEffect, useState, useMemo } from "react"
import { Doughnut } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { CheckCircle, XCircle, Clock, ListChecks } from "lucide-react"

ChartJS.register(ArcElement, Tooltip, Legend)

interface ItineraryBooking {
  date: string
  paid: number
  cancelled?: number
  pending?: number
}

function getMonth(dateStr: string): string {
  return new Date(dateStr).toLocaleString("default", { month: "long" })
}

export default function ItineraryBookingsDonut() {
  const [data, setData] = useState<ItineraryBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState("All")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/analytics/itinerary-bookings")
        if (!res.ok) throw new Error("Failed to fetch itinerary analytics")
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
        setError("Could not load itinerary analytics")
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

  const filtered = useMemo(
    () =>
      selectedMonth === "All"
        ? data
        : data.filter((d) => getMonth(d.date) === selectedMonth),
    [data, selectedMonth]
  )

  const stats = useMemo(() => {
    const totalPaid = filtered.reduce((sum, d) => sum + (d.paid || 0), 0)
    const totalCancelled = filtered.reduce((sum, d) => sum + (d.cancelled || 0), 0)
    const totalPending = filtered.reduce((sum, d) => sum + (d.pending || 0), 0)
    const total = totalPaid + totalCancelled + totalPending

    const prevData =
      selectedMonth === "All"
        ? []
        : data.filter((d) => getMonth(d.date) !== selectedMonth)
    const prevTotal = prevData.reduce(
      (sum, d) => sum + (d.paid || 0) + (d.cancelled || 0) + (d.pending || 0),
      0
    )

    const growth = prevTotal
      ? Math.round(((total - prevTotal) / prevTotal) * 100)
      : 0

    return { totalPaid, totalCancelled, totalPending, total, growth }
  }, [filtered, data, selectedMonth])

  if (loading)
    return <p className="text-center text-gray-600 mt-10">Loading itinerary analytics...</p>
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>

  const chartData = {
    labels: ["Paid", "Cancelled", "Pending"],
    datasets: [
      {
        data: [stats.totalPaid, stats.totalCancelled, stats.totalPending],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
        borderColor: ["#fff"],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    cutout: "65%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: number }) => {
            const value = ctx.raw
            const percentage = stats.total
              ? ((value / stats.total) * 100).toFixed(1)
              : "0"
            return `${ctx.label}: ${value} (${percentage}%)`
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
        {value}{" "}
        {percentage !== undefined && `(${percentage.toFixed(1)}%)`}
      </p>
      {percentage !== undefined && (
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              color === "text-green-600"
                ? "bg-green-500"
                : color === "text-red-600"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )

  return (
    <div className="mt-10 p-8 rounded-xl bg-gradient-to-br from-purple-50 via-white to-purple-100 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-800">
          Itinerary Bookings Overview
        </h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-purple-300 text-purple-900 px-3 py-1 rounded-lg shadow-sm focus:outline-none"
        >
          <option value="All">All Months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-purple-100 rounded-md px-4 py-2 mb-6 shadow-sm text-sm text-gray-700">
        {selectedMonth !== "All" ? (
          <p>
            In <span className="font-semibold text-purple-700">{selectedMonth}</span>, there were{" "}
            <span className="font-bold">{stats.total}</span> itinerary bookings (
            <span className="text-green-600">{stats.totalPaid} paid</span>,{" "}
            <span className="text-red-600">{stats.totalCancelled} cancelled</span>,{" "}
            <span className="text-yellow-600">{stats.totalPending} pending</span>). Compared to the
            previous period,{" "}
            {stats.growth >= 0
              ? `bookings increased by ${stats.growth}%`
              : `bookings decreased by ${Math.abs(stats.growth)}%`}
            .
          </p>
        ) : (
          <p>
            This donut chart shows the distribution of itinerary bookings across statuses. Use the
            month filter for detailed breakdowns.
          </p>
        )}
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl font-bold text-purple-800">{stats.total} Total</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card title="Total" value={stats.total} color="text-purple-600" icon={ListChecks} />
        <Card
          title="Paid"
          value={stats.totalPaid}
          color="text-green-600"
          icon={CheckCircle}
          percentage={(stats.totalPaid / stats.total) * 100 || 0}
        />
        <Card
          title="Cancelled"
          value={stats.totalCancelled}
          color="text-red-600"
          icon={XCircle}
          percentage={(stats.totalCancelled / stats.total) * 100 || 0}
        />
        <Card
          title="Pending"
          value={stats.totalPending}
          color="text-yellow-600"
          icon={Clock}
          percentage={(stats.totalPending / stats.total) * 100 || 0}
        />
      </div>
    </div>
  )
}
