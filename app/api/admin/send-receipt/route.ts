import { NextRequest, NextResponse } from "next/server";
import { sendReceiptEmail } from "@/lib/mail";
import { adminAuth } from "@/lib/firebaseAdmin"; // ✅ ensure admin-only

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
    if (!name || !email || !booking) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 🚀 Send receipt via Resend
    await sendReceiptEmail({ name, email, type, booking });

    return NextResponse.json({ message: "Receipt sent successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("💥 Email send failed:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
