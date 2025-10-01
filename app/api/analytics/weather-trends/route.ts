import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { format } from "date-fns";

export async function GET() {
  try {
    const [destSnap, itinSnap, promoSnap] = await Promise.all([
      db.collection("bookings").get(),
      db.collection("itineraryBookings").get(),
      db.collection("promoBookings").get(),  // promos
    ]);

    const monthMap: Record<
      string,
      {
        totalBookings: number;
        tempSumDest: number;
        tempCountDest: number;
        tempSumItin: number;
        tempCountItin: number;
        tempSumPromo: number;
        tempCountPromo: number;
        weatherCounts: Record<string, number>;
      }
    > = {};

    const normalizeDate = (raw: any): Date | null => {
      if (raw instanceof Timestamp) return raw.toDate();
      if (raw instanceof Date) return raw;
      if (raw && typeof raw === "object" && "seconds" in raw) {
        return new Date(raw.seconds * 1000);
      }
      if (typeof raw === "number") return new Date(raw);
      if (typeof raw === "string") {
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
      }
      return null;
    };

    const processDoc = (data: any, which: "dest" | "itin" | "promo") => {
      const createdAtRaw = data.createdAt;
      const d = normalizeDate(createdAtRaw);
      if (!d) return;

      const month = format(d, "MMMM");
      if (!monthMap[month]) {
        monthMap[month] = {
          totalBookings: 0,
          tempSumDest: 0,
          tempCountDest: 0,
          tempSumItin: 0,
          tempCountItin: 0,
          tempSumPromo: 0,
          tempCountPromo: 0,
          weatherCounts: {},
        };
      }

      monthMap[month].totalBookings++;

      const temp = data.weather?.temperature;
      const cond = data.weather?.condition;

      if (typeof temp === "number") {
        if (which === "dest") {
          monthMap[month].tempSumDest += temp;
          monthMap[month].tempCountDest++;
        } else if (which === "itin") {
          monthMap[month].tempSumItin += temp;
          monthMap[month].tempCountItin++;
        } else if (which === "promo") {
          monthMap[month].tempSumPromo += temp;
          monthMap[month].tempCountPromo++;
        }
      }

      if (typeof cond === "string") {
        monthMap[month].weatherCounts[cond] =
          (monthMap[month].weatherCounts[cond] || 0) + 1;
      }
    };

    // process all docs
    destSnap.forEach((doc) => processDoc(doc.data(), "dest"));
    itinSnap.forEach((doc) => processDoc(doc.data(), "itin"));
    promoSnap.forEach((doc) => processDoc(doc.data(), "promo"));

    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const result = Object.entries(monthMap)
      .map(([month, stats]) => {
        // compute averages
        const avgDest =
          stats.tempCountDest > 0 ? stats.tempSumDest / stats.tempCountDest : null;
        const avgItin =
          stats.tempCountItin > 0 ? stats.tempSumItin / stats.tempCountItin : null;
        const avgPromo =
          stats.tempCountPromo > 0 ? stats.tempSumPromo / stats.tempCountPromo : null;

        // find top condition
        const topCond =
          Object.entries(stats.weatherCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          "Unknown";

        return {
          month,
          destinationsAvgTemp: avgDest,
          itinerariesAvgTemp: avgItin,
          promosAvgTemp: avgPromo,
          bookingCount: stats.tempCountDest,     // count of dest bookings with weather
          itineraryCount: stats.tempCountItin,
          promoCount: stats.tempCountPromo,
          topCondition: topCond,
        };
      })
      .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("❌ Weather trends error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
