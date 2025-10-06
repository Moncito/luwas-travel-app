// ✅ /app/api/analytics/promos/route.ts
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET() {
  try {
    const snapshot = await db.collection("promoBookings").get();

    const dailyCounts: Record<string, { paid: number; cancelled: number; pending: number }> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const raw = data.createdAt;

      let date: string | null = null;

      // ✅ Normalize Firestore timestamps (all possible types)
      if (raw instanceof Timestamp) {
        date = raw.toDate().toISOString().split("T")[0];
      } else if (raw?.toDate) {
        date = raw.toDate().toISOString().split("T")[0];
      } else if (typeof raw === "string") {
        const d = new Date(raw);
        date = isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
      } else if (typeof raw === "number") {
        const d = new Date(raw);
        date = isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
      } else if (raw && typeof raw === "object" && "seconds" in raw) {
        const d = new Date((raw as any).seconds * 1000);
        date = isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
      }

      if (!date) return;

      if (!dailyCounts[date]) {
        dailyCounts[date] = { paid: 0, cancelled: 0, pending: 0 };
      }

      // ✅ Unified status classification
      const status = (data.status || "").toLowerCase();

      switch (status) {
        case "paid":
        case "completed":
          dailyCounts[date].paid++;
          break;

        case "cancelled":
          dailyCounts[date].cancelled++;
          break;

        case "awaiting_approval":
        case "pending":
        case "pending_payment":
        case "waiting_payment":
        case "upcoming":
        default:
          dailyCounts[date].pending++;
          break;
      }
    });

    // ✅ Format final response
    const results = Object.entries(dailyCounts).map(
      ([date, { paid, cancelled, pending }]) => ({
        date,
        paid,
        cancelled,
        pending,
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("🔥 Error fetching promo analytics:", error);
    return NextResponse.json({ error: "Failed to fetch promo analytics" }, { status: 500 });
  }
}
