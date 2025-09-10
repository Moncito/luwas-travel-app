// File: app/api/analytics/promos/route.ts
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await db.collection("promoBookings").get();

    const data = snapshot.docs.map((doc) => {
      const d = doc.data();

      // normalize createdAt
      let createdAt: Date;
      if (d.createdAt?.toDate) {
        createdAt = d.createdAt.toDate();
      } else if (d.createdAt?.seconds) {
        createdAt = new Date(d.createdAt.seconds * 1000);
      } else {
        createdAt = new Date(d.createdAt);
      }

      return {
        id: doc.id,
        date: createdAt.toISOString(),
        status: d.status || "pending",
      };
    });

    // group by date
    const grouped: Record<string, { confirmed: number; cancelled: number; pending: number }> = {};

    data.forEach((item) => {
      const day = new Date(item.date).toISOString().split("T")[0]; // YYYY-MM-DD
      if (!grouped[day]) {
        grouped[day] = { confirmed: 0, cancelled: 0, pending: 0 };
      }
      if (item.status === "completed" || item.status === "paid") {
        grouped[day].confirmed++;
      } else if (item.status === "cancelled") {
        grouped[day].cancelled++;
      } else {
        grouped[day].pending++;
      }
    });

    const result = Object.entries(grouped).map(([date, counts]) => ({
      date,
      confirmed: counts.confirmed,
      cancelled: counts.cancelled,
      pending: counts.pending,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("🔥 Error fetching promo analytics:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
