import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongo";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    return NextResponse.json({ message: "✅ Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }
}
