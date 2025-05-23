import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await db
      .collection("itineraryBookings")
      .orderBy("createdAt", "desc")
      .get();

    const bookings = snapshot.docs.map((doc) => {
      const data = doc.data();

      let createdAt: Date;
      if (data.createdAt?.toDate) {
        createdAt = data.createdAt.toDate(); // Firestore Timestamp
      } else if (data.createdAt?.seconds) {
        createdAt = new Date(data.createdAt.seconds * 1000); // Legacy seconds object
      } else {
        createdAt = new Date(); // fallback
      }

      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        date: data.date || '',
        slug: data.slug || '',
        status: data.status || "upcoming",
        people: data.people || 1,
        createdAt, // ✅ always valid Date object
      };
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("🔥 Error loading itinerary bookings", err);
    return new NextResponse("Server Error", { status: 500 });
  }
}
