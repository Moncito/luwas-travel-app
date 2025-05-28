// scripts/patchWeather.ts
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'

import admin from 'firebase-admin'
import serviceAccount from './serviceAccountKey.json'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  })
}

const db = admin.firestore()


// Load from .env.local explicitly
dotenv.config({ path: '.env.local' })

const API_KEY = process.env.WEATHER_API_KEY
if (!API_KEY) throw new Error('Missing WEATHER_API_KEY in .env.local')

const BASE_URL = 'https://api.weatherapi.com/v1/history.json'

async function patchWeatherToBookings() {
  const bookingsSnapshot = await db.collection('bookings').get()
  const destinationsSnapshot = await db.collection('destinations').get()

  const destinationMap: Record<string, { lat: number; lon: number }> = {}
  destinationsSnapshot.forEach(doc => {
    const data = doc.data()
    destinationMap[doc.id] = { lat: data.latitude, lon: data.longitude }
  })

  for (const doc of bookingsSnapshot.docs) {
    const booking = doc.data()
    const destId = booking.destinationId
    const createdAt = booking.createdAt?.toDate?.() || (booking.createdAt?.seconds ? new Date(booking.createdAt.seconds * 1000) : null)
    if (!createdAt || !destId || !destinationMap[destId]) continue

    const dateStr = createdAt.toISOString().split('T')[0]
    const { lat, lon } = destinationMap[destId]
    const url = `${BASE_URL}?key=${API_KEY}&q=${lat},${lon}&dt=${dateStr}`

    try {
      const res = await fetch(url)
      const json = await res.json()

      const weather = json.forecast?.forecastday?.[0]?.day
      const avgTemp = weather?.avgtemp_c
      const condition = weather?.condition?.text

      if (avgTemp && condition) {
        await doc.ref.update({
          weather: {
            avgTemp,
            condition,
          },
        })
        console.log(`✅ Updated: ${doc.id} — ${avgTemp}°C, ${condition}`)
      } else {
        console.warn(`⚠️ No weather data for ${doc.id} on ${dateStr}`)
      }
    } catch (err) {
      console.error(`❌ Failed to fetch weather for ${doc.id}:`, err)
    }
  }

  console.log('🌤️ Weather patching complete.')
}

patchWeatherToBookings()
