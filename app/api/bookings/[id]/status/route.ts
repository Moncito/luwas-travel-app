import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

// ✅ PATCH: Update booking status (for Admin quick updates)
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status field is required" },
        { status: 400 }
      );
    }

    // 🔎 Check booking in all possible collections (hybrid model)
    const collections = ["bookings", "itineraryBookings", "promoBookings"];
    let updated = false;

    for (const col of collections) {
      const docRef = db.collection(col).doc(id);
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const current = docSnap.data();

        // ✅ Keep consistent fields across all booking types
        await docRef.update({
          status,
          updatedAt: FieldValue.serverTimestamp(),
        });

        console.log(
          `✅ Updated booking ${id} (${col}) → new status: ${status}`
        );
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

    return NextResponse.json({
      message: `Booking status updated to '${status}' successfully`,
    });
  } catch (error) {
    console.error("🔥 Failed to update booking status:", error);
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}
