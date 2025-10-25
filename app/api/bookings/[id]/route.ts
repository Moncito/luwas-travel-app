import { db } from "@/firebase/admin";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

// ✅ DELETE booking
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  try {
    await db.collection("bookings").doc(id).delete();
    console.log(`🗑️ Deleted booking ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}

// ✅ PATCH booking (update fields like status, activities, totalPrice, etc.)
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      status,
      activities,
      totalPrice,
      tripType,
      tripPackageId,
      specialRequests,
      proofUrl,
    } = body;

    // 🧩 Validate that at least one field is provided
    if (
      !status &&
      !activities &&
      !totalPrice &&
      !tripType &&
      !tripPackageId &&
      !specialRequests &&
      !proofUrl
    ) {
      return NextResponse.json(
        { error: "No fields provided to update." },
        { status: 400 }
      );
    }

    // ✅ Find booking document
    const bookingRef = db.collection("bookings").doc(id);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json(
        { error: `Booking ${id} not found` },
        { status: 404 }
      );
    }

    const currentData = bookingSnap.data();

    // ✅ Prepare update payload
    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status) updateData.status = status;
    if (tripType) updateData.tripType = tripType;
    if (tripPackageId) updateData.tripPackageId = tripPackageId;
    if (specialRequests) updateData.specialRequests = specialRequests;
    if (proofUrl) updateData.proofUrl = proofUrl;

    // 🔹 If custom trip → update activities & recompute total
    if (tripType === "custom" && Array.isArray(activities)) {
      const computedTotal = activities.reduce(
        (sum, act) => sum + (Number(act.price) || 0),
        0
      );
      updateData.activities = activities;
      updateData.totalPrice = computedTotal;
    }

    // 🔹 If fixed trip → allow manual price adjustment (optional)
    if (tripType === "fixed" && totalPrice) {
      updateData.totalPrice = Number(totalPrice);
    }

    // ✅ Update Firestore
    await bookingRef.update(updateData);

    console.log(`✅ Booking ${id} updated successfully`);
    return NextResponse.json({
      message: "Booking updated successfully",
      updated: updateData,
    });
  } catch (error) {
    console.error("🔥 Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
