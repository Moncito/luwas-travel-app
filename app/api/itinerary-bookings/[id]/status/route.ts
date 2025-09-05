// app/api/itinerary-bookings/[id]/status/route.ts
import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    await db.collection("itineraryBookings").doc(params.id).update({
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 Failed to update itinerary status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
