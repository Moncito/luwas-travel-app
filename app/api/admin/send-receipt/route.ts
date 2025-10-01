import { NextRequest, NextResponse } from "next/server";
import { sendReceiptEmail } from "@/lib/mail";
import { adminAuth } from "@/lib/firebaseAdmin"; // ✅ admin check

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token" }, { status: 401 });
    }

    // 🔑 Verify admin
    const decoded = await adminAuth.verifySessionCookie(token, true);
    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    // 📩 Parse body
    const { name, email, type, booking } = await req.json();
    if (!name || !email || !type || !booking) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let normalizedBooking;

    if (type === "promo") {
      normalizedBooking = {
        ...booking,
        id: booking.id || "N/A",
        type: "promo",
        promoTitle: booking.promoTitle || "Promo Booking",
        finalPrice: booking.finalPrice ?? booking.amount ?? 0,
        discountApplied: booking.discountApplied ?? 0,
        departureDate: booking.departureDate || "N/A",
      };
    }

    if (type === "destination") {
      normalizedBooking = {
        ...booking,
        id: booking.id || "N/A",
        type: "destination",
        destinationName: booking.destinationName || booking.destination || "Destination Booking",
        amount: booking.amount ?? booking.totalPrice ?? 0,
        departureDate: booking.departureDate || "N/A",
      };
    }

    if (type === "itinerary") {
      normalizedBooking = {
        ...booking,
        id: booking.id || "N/A",
        type: "itinerary",
        itineraryTitle: booking.itineraryTitle || booking.title || "Itinerary Booking",
        amount: booking.amount ?? booking.totalPrice ?? 0,
        departureDate: booking.departureDate || booking.date || "N/A",
      };
    }

    // 🚀 Send email
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
