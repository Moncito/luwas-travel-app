import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongo";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password, role } = await req.json();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: role || "user", // default role is "user"
    });

    return NextResponse.json({
      message: "✅ User registered successfully",
      user: { email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "❌ Registration failed" }, { status: 500 });
  }
}
