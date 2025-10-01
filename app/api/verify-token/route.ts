import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token ?? req.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
    }

    const decoded = await adminAuth.verifySessionCookie(token, true);

    let isAdmin = decoded.admin ?? false;

    // 🔍 Firestore fallback
    if (!isAdmin) {
      const userDoc = await adminDb.collection("users").doc(decoded.uid).get();
      if (userDoc.exists && userDoc.data()?.role === "admin") {
        isAdmin = true;
      }
    }

    return NextResponse.json({
      valid: true,
      uid: decoded.uid,
      admin: isAdmin,
      email: decoded.email,
    });
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    return NextResponse.json(
      { valid: false, error: "Invalid session or token expired." },
      { status: 401 }
    );
  }
}
