// ✅ sets 'adminSession' cookie
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ success: false, message: "Missing token" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.admin) {
      return NextResponse.json({ success: false, message: "Not an admin" }, { status: 403 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 7 * 1000, // 7 days
    });

    const res = NextResponse.json({ success: true });

    res.cookies.set("adminSession", sessionCookie, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ✅ works in both localhost and vercel
      path: "/",
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ success: false, message: "Token verification failed" }, { status: 401 });
  }
}
