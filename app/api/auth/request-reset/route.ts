import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db/mongo";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";


const JWT_SECRET = process.env.JWT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "No account found with that email" }, { status: 404 });
    }

    // Generate reset token (expires in 15 min)
    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });

    const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;

    // Send email (basic nodemailer setup)
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your SMTP provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Luwas Travel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `<p>Click the link below to reset your password:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link will expire in 15 minutes.</p>`,
    });

    return NextResponse.json({ message: "✅ Reset link sent to email" });
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json({ error: "Failed to send reset link" }, { status: 500 });
  }
}
