import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";

export async function GET() {
  try {
    const snapshot = await db.collection("itineraryBookings").get();

    const results = snapshot.docs.map((doc) => {
      const data = doc.data();
      let createdAt = data.createdAt;

      if (createdAt instanceof Timestamp) {
        createdAt = createdAt.toDate().toISOString(); // normalize ✅
      } else if (typeof createdAt === "number") {
        createdAt = new Date(createdAt).toISOString(); // numeric timestamp
      } else if (createdAt instanceof Date) {
        createdAt = createdAt.toISOString();
      }

      return {
        id: doc.id,
        status: data.status || "upcoming",
        createdAt, // always ISO string now
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching itinerary bookings analytics:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
