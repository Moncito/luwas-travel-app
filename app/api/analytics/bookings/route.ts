import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET() {
  try {
    const snapshot = await db.collection("bookings").get();

    const dailyCounts: Record<
      string,
      { confirmed: number; cancelled: number; pending: number }
    > = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const raw = data.createdAt;

      let date: string | null = null;

      if (raw instanceof Timestamp) {
        date = raw.toDate().toISOString().split("T")[0];
      } else if (typeof raw === "number") {
        date = new Date(raw).toISOString().split("T")[0];
      } else if (typeof raw === "string") {
        date = new Date(raw).toISOString().split("T")[0];
      }

      if (!date) return;

      if (!dailyCounts[date]) {
        dailyCounts[date] = { confirmed: 0, cancelled: 0, pending: 0 };
      }

      // ✅ Map statuses properly
      if (data.status === "paid" || data.status === "completed") {
        dailyCounts[date].confirmed += 1;
      } else if (data.status === "cancelled") {
        dailyCounts[date].cancelled += 1;
      } else if (
        data.status === "upcoming" ||
        data.status === "waiting_payment"
      ) {
        dailyCounts[date].pending += 1;
      }
    });

    const results = Object.entries(dailyCounts).map(
      ([date, { confirmed, cancelled, pending }]) => ({
        date,
        confirmed,
        cancelled,
        pending,
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching booking analytics:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
