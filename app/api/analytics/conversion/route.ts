// File: app/api/analytics/conversion/route.ts
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

async function calcConversionRate(collection: string) {
  const snap = await db.collection(collection).get();
  let total = 0;
  let success = 0;

  snap.forEach((doc) => {
    const data = doc.data();
    total++;
    if (["paid", "completed"].includes(data.status)) success++;
  });

  const rate = total > 0 ? (success / total) * 100 : 0;
  return { total, success, rate: parseFloat(rate.toFixed(1)) };
}

export async function GET() {
  try {
    const [dest, itin, promo] = await Promise.all([
      calcConversionRate("bookings"),
      calcConversionRate("itineraryBookings"),
      calcConversionRate("promoBookings"),
    ]);

    const overallTotal = dest.total + itin.total + promo.total;
    const overallSuccess = dest.success + itin.success + promo.success;
    const overallRate =
      overallTotal > 0 ? (overallSuccess / overallTotal) * 100 : 0;

    // 🧠 Generate descriptive insights
    const modules = [
      { name: "Destinations", rate: dest.rate },
      { name: "Itineraries", rate: itin.rate },
      { name: "Promos", rate: promo.rate },
    ];
    const top = modules.reduce((a, b) => (a.rate > b.rate ? a : b));

    const desc = `Among all modules, **${top.name}** achieved the highest conversion rate at **${top.rate}%**, indicating stronger user engagement and trust in this booking type. The overall conversion rate stands at **${overallRate.toFixed(
      1
    )}%**, suggesting a ${
      overallRate > 60
        ? "healthy and efficient booking process."
        : "need for optimization in user booking flow."
    }`;

    return NextResponse.json({
      modules: {
        Destinations: dest,
        Itineraries: itin,
        Promos: promo,
      },
      overall: parseFloat(overallRate.toFixed(1)),
      insights: desc,
      topModule: top.name,
    });
  } catch (error) {
    console.error("🔥 Conversion analytics failed:", error);
    return NextResponse.json({ error: "Failed to fetch conversion analytics" }, { status: 500 });
  }
}
