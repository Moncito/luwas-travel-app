import { NextResponse } from 'next/server'
import { db } from '@/firebase/admin'
import { format } from 'date-fns'

export async function GET() {
  const snapshot = await db.collection('bookings').get()

  const monthMap: Record<string, {
    totalBookings: number
    tempSum: number
    weatherCounts: Record<string, number>
  }> = {}

  snapshot.forEach(doc => {
    const data = doc.data()
    const createdAt = data.createdAt?.toDate?.() || (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null)
    const temp = data.weather?.avgTemp
    const condition = data.weather?.condition

    if (!createdAt || !temp || !condition) return

    const month = format(createdAt, 'MMMM')

    if (!monthMap[month]) {
      monthMap[month] = {
        totalBookings: 0,
        tempSum: 0,
        weatherCounts: {}
      }
    }

    monthMap[month].totalBookings++
    monthMap[month].tempSum += temp
    monthMap[month].weatherCounts[condition] = (monthMap[month].weatherCounts[condition] || 0) + 1
  })

  const result = Object.entries(monthMap).map(([month, data]) => {
    const mostCommonWeather = Object.entries(data.weatherCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown'
    const avgTemp = parseFloat((data.tempSum / data.totalBookings).toFixed(1))

    return {
      month,
      avgTemp,
      totalBookings: data.totalBookings,
      topCondition: mostCommonWeather,
    }
  }).sort((a, b) => new Date(`1 ${a.month} 2023`).getMonth() - new Date(`1 ${b.month} 2023`).getMonth()) // sort Jan → Dec

  return NextResponse.json(result)
}
