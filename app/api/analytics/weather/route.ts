import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET() {
  try {
    const bookingsSnap = await db.collection("bookings").get();
    const itinerariesSnap = await db.collection("itineraryBookings").get();

    // Helper: normalize month
    const toMonth = (date: any) => {
      let d: Date | null = null;
      if (date instanceof Timestamp) d = date.toDate();
      else if (date instanceof Date) d = date;
      else if (typeof date === "number") d = new Date(date);
      else if (typeof date === "string") d = new Date(date);

      return d ? d.toLocaleString("default", { month: "long" }) : null;
    };

    const monthly: Record<
      string,
      {
        destinationsTemps: number[];
        itinerariesTemps: number[];
        bookingCount: number;
        itineraryCount: number;
        conditions: string[];
      }
    > = {};

    // Process bookings
    bookingsSnap.forEach((doc) => {
      const data = doc.data();
      const month = toMonth(data.createdAt);
      if (!month) return;

      if (!monthly[month]) {
        monthly[month] = {
          destinationsTemps: [],
          itinerariesTemps: [],
          bookingCount: 0,
          itineraryCount: 0,
          conditions: [],
        };
      }

      monthly[month].bookingCount++;
      if (data.weather?.temperature) {
        monthly[month].destinationsTemps.push(data.weather.temperature);
      }
      if (data.weather?.condition) {
        monthly[month].conditions.push(data.weather.condition);
      }
    });

    // Process itineraries
    itinerariesSnap.forEach((doc) => {
      const data = doc.data();
      const month = toMonth(data.createdAt);
      if (!month) return;

      if (!monthly[month]) {
        monthly[month] = {
          destinationsTemps: [],
          itinerariesTemps: [],
          bookingCount: 0,
          itineraryCount: 0,
          conditions: [],
        };
      }

      monthly[month].itineraryCount++;
      if (data.weather?.temperature) {
        monthly[month].itinerariesTemps.push(data.weather.temperature);
      }
      if (data.weather?.condition) {
        monthly[month].conditions.push(data.weather.condition);
      }
    });

    // Build final array
    const results = Object.entries(monthly).map(([month, d]) => {
      const avg = (arr: number[]) =>
        arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

      // Find most common condition
      const topCondition =
        d.conditions.length > 0
          ? d.conditions
              .sort(
                (a, b) =>
                  d.conditions.filter((c) => c === b).length -
                  d.conditions.filter((c) => c === a).length
              )[0]
          : "N/A";

      return {
        month,
        destinationsAvgTemp: avg(d.destinationsTemps),
        itinerariesAvgTemp: avg(d.itinerariesTemps),
        bookingCount: d.bookingCount,
        itineraryCount: d.itineraryCount,
        topCondition,
      };
    });

    return NextResponse.json(results);
  } catch (err: any) {
    console.error("❌ Weather analytics error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
