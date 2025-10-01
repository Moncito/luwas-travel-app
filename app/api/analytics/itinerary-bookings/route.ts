// app/api/analytics/itinerary-bookings/route.ts
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET() {
  try {
    const snap = await db
      .collection("itineraryBookings")
      .orderBy("createdAt", "desc")
      .get();

    const rows = snap.docs.map((doc) => {
      const data = doc.data() || {};
      const raw = data.createdAt;

      // ✅ normalize createdAt -> ISO string (or null)
      let createdAt: string | null = null;
      if (raw instanceof Timestamp) {
        createdAt = raw.toDate().toISOString();
      } else if (raw?.toDate) {
        createdAt = raw.toDate().toISOString();
      } else if (typeof raw === "string") {
        const d = new Date(raw);
        createdAt = isNaN(d.getTime()) ? null : d.toISOString();
      } else if (typeof raw === "number") {
        const d = new Date(raw);
        createdAt = isNaN(d.getTime()) ? null : d.toISOString();
      } else if (raw && typeof raw === "object" && "seconds" in raw) {
        // if something serialized like { seconds, nanoseconds }
        const d = new Date((raw as any).seconds * 1000);
        createdAt = isNaN(d.getTime()) ? null : d.toISOString();
      }

      return {
        id: doc.id,
        status: data.status ?? "upcoming",
        createdAt,
      };
    });

    return NextResponse.json(rows);
  } catch (err) {
    console.error("❌ Error fetching itinerary analytics:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
