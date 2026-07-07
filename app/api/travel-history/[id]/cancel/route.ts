import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getAuth } from "firebase-admin/auth";

interface CancellationRequest {
  reason: string;
  details?: string;
  bookingType: "trip" | "itinerary" | "promo";
}

const COLLECTION_MAP = {
  trip: "bookings",
  itinerary: "itineraryBookings",
  promo: "promoBookings",
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { reason, details, bookingType } = (await req.json()) as CancellationRequest;

    // Validate required fields
    if (!id || !reason || !bookingType) {
      return NextResponse.json(
        { error: "Missing required fields: id, reason, bookingType" },
        { status: 400 }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    let userId: string;
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get collection based on booking type
    const collectionName = COLLECTION_MAP[bookingType as keyof typeof COLLECTION_MAP];
    if (!collectionName) {
      return NextResponse.json(
        { error: "Invalid booking type" },
        { status: 400 }
      );
    }

    // Get the booking
    const bookingRef = db.collection(collectionName).doc(id);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const bookingData = bookingDoc.data();

    // Verify ownership: check if userId matches either userId field or paidBy.uid
    const bookingUserId = bookingData?.userId || bookingData?.paidBy?.uid;
    if (bookingUserId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: You can only cancel your own bookings" },
        { status: 403 }
      );
    }

    // Check if already cancelled
    if (bookingData?.status === "cancelled") {
      return NextResponse.json(
        { error: "This booking is already cancelled" },
        { status: 400 }
      );
    }

    // Update the booking with cancellation info
    const now = new Date();
    await bookingRef.update({
      status: "cancelled",
      cancellationReason: reason,
      cancellationDetails: details || null,
      cancelledAt: now,
      cancelledBy: userId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Booking cancelled successfully",
        booking: {
          id,
          status: "cancelled",
          cancelledAt: now.toISOString(),
          reason,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("🔥 Cancel booking error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
