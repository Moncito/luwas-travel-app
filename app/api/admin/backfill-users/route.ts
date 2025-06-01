import { NextResponse } from "next/server";
import { auth, db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET() {
  try {
    const result = await auth.listUsers(1000);
    const batch = db.batch();

    result.users.forEach((user) => {
      const userRef = db.collection("users").doc(user.uid);
      batch.set(
        userRef,
        {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Unnamed",
          createdAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();
    return NextResponse.json({ success: true, message: "Backfilled all users" });
  } catch (err) {
    console.error("❌ Backfill error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
