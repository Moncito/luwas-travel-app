import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // collections to check
    const collections = ["bookings", "itineraryBookings", "promoBookings"];

    let updated = false;

    for (const col of collections) {
      const docRef = db.collection(col).doc(id);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        await docRef.update({
          status,
          updatedAt: new Date(),
        });
        updated = true;
        break;
      }
    }

    if (!updated) {
      return NextResponse.json(
        { error: `Booking ${id} not found in any collection` },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Booking updated successfully" });
  } catch (err: any) {
    console.error("🔥 Failed to update booking status:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
