import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token ?? req.cookies.get("session")?.value; // ✅ fixed cookie key

    if (!token) {
      console.error("❌ No token provided in body or cookies.");
      return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });
    }

    const decoded = await adminAuth.verifySessionCookie(token, true);

    if (!decoded.admin) {
      return NextResponse.json(
        { valid: false, message: "Not authorized. Admin access only." },
        { status: 403 }
      );
    }

    return NextResponse.json({ valid: true, uid: decoded.uid });
  } catch (err) {
    console.error("❌ Token verification failed:", err);
    return NextResponse.json(
      { valid: false, error: "Invalid session or token expired." },
      { status: 401 }
    );
  }
}
