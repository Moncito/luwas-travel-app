import { NextResponse } from 'next/server'
import { db } from '@/firebase/admin'
import { format } from 'date-fns'

export async function GET() {
  try {
    // 🔄 Fetch both destination and itinerary bookings
    const [tripSnap, itinerarySnap] = await Promise.all([
      db.collection("bookings").get(),
      db.collection("itineraryBookings").get(),
    ]);

    const allDocs = [...tripSnap.docs, ...itinerarySnap.docs];

    const monthMap: Record<string, {
      totalBookings: number;
      tempSum: number;
      weatherCounts: Record<string, number>;
    }> = {};

    allDocs.forEach((doc) => {
      const data = doc.data();

      const createdAt = data.createdAt instanceof Date
        ? data.createdAt
        : data.createdAt?.toDate?.() ||
          (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000) : null);

      const temp = data.weather?.avgTemp;
      const condition = data.weather?.condition;

      if (!createdAt || typeof temp !== "number" || typeof condition !== "string") {
        console.warn("⛔ Skipping invalid doc:", { id: doc.id, createdAt, temp, condition });
        return;
      }

      const month = format(createdAt, "MMMM");

      if (!monthMap[month]) {
        monthMap[month] = {
          totalBookings: 0,
          tempSum: 0,
          weatherCounts: {},
        };
      }

      monthMap[month].totalBookings++;
      monthMap[month].tempSum += temp;
      monthMap[month].weatherCounts[condition] =
        (monthMap[month].weatherCounts[condition] || 0) + 1;
    });

    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const result = Object.entries(monthMap)
      .map(([month, data]) => {
        const mostCommonWeather = Object.entries(data.weatherCounts).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0] || "Unknown";

        const avgTemp = parseFloat((data.tempSum / data.totalBookings).toFixed(1));

        return {
          month,
          avgTemp,
          totalBookings: data.totalBookings,
          topCondition: mostCommonWeather,
        };
      })
      .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Weather trend analytics error:", error);
    return NextResponse.json({ error: "Failed to compute weather trends" }, { status: 500 });
  }
}
