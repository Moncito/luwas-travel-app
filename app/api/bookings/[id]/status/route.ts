import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = params.id;

    if (!bookingId) {
      console.error("❌ Missing booking ID");
      return NextResponse.json({ success: false, message: "Booking ID is required." }, { status: 400 });
    }

    const docRef = db.collection("bookings").doc(bookingId);

    await docRef.update({
      status: "paid",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("🔥 Failed to update booking:", err.message, err.code, err.stack);
    return NextResponse.json({ success: false, message: "Failed to update booking." }, { status: 500 });
  }
}
