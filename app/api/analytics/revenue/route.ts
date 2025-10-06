// app/api/analytics/revenue/route.ts
import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collections = [
      { name: "bookings", label: "Destinations" }, // ✅ renamed
      { name: "itineraryBookings", label: "Itineraries" },
      { name: "promoBookings", label: "Promos" },
    ];

    const monthlyMap: Record<
      string,
      {
        Destinations: number;
        Itineraries: number;
        Promos: number;
        Total: number;
        Count: Record<string, number>;
      }
    > = {};

    for (const col of collections) {
      const snapshot = await db
        .collection(col.name)
        .where("status", "==", "paid")
        .get();

      snapshot.forEach((doc) => {
        const data = doc.data();

        // 🔹 Extract date safely
        const createdAt =
          data.createdAt?.toDate?.() ||
          data.paidAt?.toDate?.() ||
          data.updatedAt?.toDate?.() ||
          new Date();

        // 🔹 Smart field detection
        const amount =
          typeof data.finalPrice === "number"
            ? data.finalPrice
            : typeof data.totalPrice === "number"
            ? data.totalPrice
            : 0;

        if (amount <= 0) return; // Skip invalid

        const month = createdAt.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        // 🔹 Initialize month if missing
        if (!monthlyMap[month]) {
          monthlyMap[month] = {
            Destinations: 0,
            Itineraries: 0,
            Promos: 0,
            Total: 0,
            Count: { Destinations: 0, Itineraries: 0, Promos: 0 },
          };
        }

        // 🔹 Aggregate totals
        monthlyMap[month][col.label] += amount;
        monthlyMap[month].Total += amount;
        monthlyMap[month].Count[col.label] += 1;
      });
    }

    // 🔹 Convert map → array
    const monthly = Object.entries(monthlyMap)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // 🔹 Compute month-over-month growth
    let growth = 0;
    if (monthly.length >= 2) {
      const prev = monthly[monthly.length - 2];
      const curr = monthly[monthly.length - 1];
      const prevTotal = prev.Total || 0;
      const currTotal = curr.Total || 0;
      growth = prevTotal
        ? ((currTotal - prevTotal) / prevTotal) * 100
        : currTotal > 0
        ? 100
        : 0;
    }

    return NextResponse.json({
      monthly,
      growth: Math.round(growth * 100) / 100,
    });
  } catch (error) {
    console.error("Revenue API Error:", error);
    return NextResponse.json(
      { error: "Failed to compute revenue analytics" },
      { status: 500 }
    );
  }
}
