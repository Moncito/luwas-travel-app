import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET() {
  try {
    const snapshot = await db.collection("bookings").get();

    const dailyCounts: Record<string, number> = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const raw = data.createdAt;

      let date: string | null = null;

      if (raw instanceof Timestamp) {
        date = raw.toDate().toISOString().split("T")[0];
      } else if (typeof raw === "number") {
        date = new Date(raw).toISOString().split("T")[0];
      }

      if (date) {
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      }
    });

    const results = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      bookings: count,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching booking analytics:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
