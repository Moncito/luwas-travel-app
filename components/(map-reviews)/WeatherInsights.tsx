'use client'

import { useEffect, useState } from 'react'

interface Props {
  title: string
  location: string
}

interface BestTime {
  label: string
  reason: string
  emoji: string
}

interface WeatherInfo {
  label: string
  months: string
  temperature: string
}

export default function WeatherInsights({ title, location }: Props) {
  const [bestTime, setBestTime] = useState<BestTime[]>([])
  const [weatherInfo, setWeatherInfo] = useState<WeatherInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/ai/weather', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, location }),
        })

        const data = await res.json()
        setBestTime(data.bestTime || [])
        setWeatherInfo(data.weatherInfo || [])
      } catch (err) {
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [title, location])

  if (loading || (bestTime.length === 0 && weatherInfo.length === 0)) return null

  return (
    <section className="max-w-4xl mx-auto px-6 pb-16 space-y-8">
      <h2 className="text-2xl font-bold text-blue-900 text-center">
        🌦️ Weather Insights
      </h2>

      {/* Best Time to Visit */}
      {bestTime.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Best Time to Visit:</h3>
          <ul className="text-sm text-gray-700 space-y-2 pl-4">
            {bestTime.map((time, i) => (
              <li key={i}>
                {time.emoji} <strong>{time.label}:</strong> {time.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weather Info */}
      {weatherInfo.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Weather Info:</h3>
          <ul className="text-sm text-gray-700 space-y-2 pl-4">
            {weatherInfo.map((info, i) => (
              <li key={i}>
                <strong>{info.label} ({info.months}):</strong> {info.temperature}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
