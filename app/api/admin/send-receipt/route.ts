import { NextRequest, NextResponse } from "next/server";
import { sendReceiptEmail } from "@/lib/mail";
import { adminAuth } from "@/lib/firebaseAdmin"; // ✅ admin check

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token" }, { status: 401 });
    }

    // 🔑 Verify token
    const decoded = await adminAuth.verifySessionCookie(token, true);
    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    // 📩 Parse request body
    const { name, email, type, booking } = await req.json();

    if (!name || !email || !type || !booking) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ✅ Normalize booking structure for promos
    let normalizedBooking = booking;

    if (type === "promo") {
      normalizedBooking = {
        ...booking,
        type: "promo",
        promoTitle: booking.promoTitle || "Promo Booking",
        finalPrice: booking.finalPrice ?? 0,
        discountApplied: booking.discountApplied ?? 0,
      };
    }

    if (type === "destination") {
      normalizedBooking = {
        ...booking,
        type: "destination",
        destinationName: booking.destinationName || booking.destination || "Destination Booking",
        amount: booking.amount ?? booking.totalPrice ?? 0,
      };
    }

    if (type === "itinerary") {
      normalizedBooking = {
        ...booking,
        type: "itinerary",
        itineraryTitle: booking.itineraryTitle || booking.title || "Itinerary Booking",
        amount: booking.amount ?? booking.totalPrice ?? 0,
      };
    }

    // 🚀 Send receipt email (handles all types inside mail.ts)
    await sendReceiptEmail({ name, email, type, booking: normalizedBooking });

    return NextResponse.json({ message: "Receipt sent successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("💥 Email send failed:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
