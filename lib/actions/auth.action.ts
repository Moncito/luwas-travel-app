"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

// ✅ Set session cookie securely
export async function setSessionCookie(idToken: string) {
  const SESSION_DURATION = 60 * 60 * 24 * 7; // moved inside ✅
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    httpOnly: true,
    secure: true,
    maxAge: SESSION_DURATION,
    path: "/",
    sameSite: "none",
  });
}

// ✅ Write user to Firestore after sign-up
export async function signUp({
  uid,
  email,
  name,
}: {
  uid: string;
  email: string;
  name: string;
}) {
  try {
    const docRef = db.collection("users").doc(uid);
    const existing = await docRef.get();

    if (!existing.exists) {
      await docRef.set({
        uid,
        email,
        name,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("🔥 Error writing Firestore user:", error);
    return { success: false, message: "Failed to store user in Firestore." };
  }
}

// ✅ Ensure user exists and sync to Firestore on login
export async function signIn({
  email,
  idToken,
}: {
  email: string;
  idToken: string;
}) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User not found. Please sign up.",
      };
    }

    await setSessionCookie(idToken);

    const userRef = db.collection("users").doc(userRecord.uid);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      await userRef.set({
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName || "Unnamed",
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      message: "Logged in successfully.",
    };
  } catch (error) {
    console.error("🔥 Sign-in Error:", error);
    return {
      success: false,
      message: "Login failed. Please try again.",
    };
  }
}

// ✅ Remove session cookie
export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// ✅ Get currently authenticated user
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const userSnap = await db.collection("users").doc(decoded.uid).get();
    if (!userSnap.exists) return null;

    return {
      ...userSnap.data(),
      id: userSnap.id,
    };
  } catch (err) {
    console.error("Session verification failed:", err);
    return null;
  }
}

// ✅ Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return false;

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return !!decoded;
  } catch {
    return false;
  }
}
