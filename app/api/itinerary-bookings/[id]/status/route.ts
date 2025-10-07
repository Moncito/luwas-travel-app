import { NextResponse } from "next/server";
import { db } from "@/firebase/admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    // ✅ Await params properly
    const { id } = await context.params;
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    // ✅ Update the correct Firestore collection
    await db.collection("itineraryBookings").doc(id).update({
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: "Itinerary status updated successfully" });
  } catch (err) {
    console.error("🔥 Failed to update itinerary status:", err);
    return NextResponse.json(
      { error: "Failed to update status", details: String(err) },
      { status: 500 }
    );
  }
}
