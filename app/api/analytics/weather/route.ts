import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch both bookings + itineraryBookings
    const [bookingsSnap, itinerariesSnap] = await Promise.all([
      db.collection("bookings").get(),
      db.collection("itineraryBookings").get(),
    ]);

    // Helper to process snapshot
    const processDocs = (docs: FirebaseFirestore.QuerySnapshot, type: "booking" | "itinerary") => {
      return docs.docs
        .map((doc) => {
          const data = doc.data();
          if (!data?.createdAt || !data.weather?.temperature || !data.weather?.condition) {
            console.warn("⛔ Skipping invalid doc:", { id: doc.id, ...data });
            return null;
          }

          let createdAt: Date;
          if (data.createdAt?.toDate) {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt?.seconds) {
            createdAt = new Date(data.createdAt.seconds * 1000);
          } else {
            createdAt = new Date(data.createdAt);
          }

          const month = createdAt.toLocaleString("default", { month: "long" });

          return {
            id: doc.id,
            type,
            month,
            temperature: Number(data.weather.temperature),
            condition: data.weather.condition,
          };
        })
        .filter(Boolean) as {
          id: string;
          type: "booking" | "itinerary";
          month: string;
          temperature: number;
          condition: string;
        }[];
    };

    const bookings = processDocs(bookingsSnap, "booking");
    const itineraries = processDocs(itinerariesSnap, "itinerary");

    const all = [...bookings, ...itineraries];

    // Group by month
    const grouped: Record<
      string,
      {
        bookingTemps: number[];
        itineraryTemps: number[];
        bookingCount: number;
        itineraryCount: number;
        conditions: string[];
      }
    > = {};

    all.forEach((item) => {
      if (!grouped[item.month]) {
        grouped[item.month] = {
          bookingTemps: [],
          itineraryTemps: [],
          bookingCount: 0,
          itineraryCount: 0,
          conditions: [],
        };
      }

      grouped[item.month].conditions.push(item.condition);

      if (item.type === "booking") {
        grouped[item.month].bookingTemps.push(item.temperature);
        grouped[item.month].bookingCount++;
      } else {
        grouped[item.month].itineraryTemps.push(item.temperature);
        grouped[item.month].itineraryCount++;
      }
    });

    // Transform into chart-ready data
    const result = Object.entries(grouped).map(([month, values]) => {
      const avg = (arr: number[]) =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

      const conditionCounts = values.conditions.reduce((acc, c) => {
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topCondition = Object.entries(conditionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A";

      return {
        month,
        destinationsAvgTemp: avg(values.bookingTemps),
        itinerariesAvgTemp: avg(values.itineraryTemps),
        bookingCount: values.bookingCount,
        itineraryCount: values.itineraryCount,
        topCondition,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("🔥 Error generating weather analytics:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
