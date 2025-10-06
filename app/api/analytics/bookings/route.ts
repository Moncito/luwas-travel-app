// ✅ /app/api/analytics/bookings/route.ts
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET() {
  try {
    const snapshot = await db.collection("bookings").get();

    const dailyCounts: Record<string, { paid: number; cancelled: number; pending: number }> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const raw = data.createdAt;

      let date: string | null = null;

      // ✅ Normalize timestamps from Firestore
      if (raw instanceof Timestamp) {
        date = raw.toDate().toISOString().split("T")[0];
      } else if (raw instanceof Date) {
        date = raw.toISOString().split("T")[0];
      } else if (typeof raw === "number") {
        date = new Date(raw).toISOString().split("T")[0];
      } else if (typeof raw === "string") {
        date = new Date(raw).toISOString().split("T")[0];
      }

      if (!date) return;

      if (!dailyCounts[date]) {
        dailyCounts[date] = { paid: 0, cancelled: 0, pending: 0 };
      }

      // ✅ Corrected grouping by actual Firestore statuses
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

    // ✅ Format data for frontend
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
    console.error("❌ Error fetching booking analytics:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
