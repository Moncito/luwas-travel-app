"use server"

import { auth, db } from "@/firebase/admin"
import { cookies } from "next/headers"
import { FieldValue } from "firebase-admin/firestore"
import type { User } from "@/types/User"


const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies() // ✅ Await required here

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000,
  })

  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  })
}

// 🔐 Sign up using Admin SDK
export async function signUp({ email, password, name }: { email: string; password: string; name: string }) {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    })

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      name,
      createdAt: FieldValue.serverTimestamp(),
    })

    return { success: true }
  } catch (error) {
    console.error("Error signing up:", error)
    return { success: false, error }
  }
}

// Sign in user (verifies and sets session)
export async function signIn(params: SignInParams) {
  const { email, idToken } = params

  try {
    const userRecord = await auth.getUserByEmail(email)
    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Create an account.",
      }
    }

    await setSessionCookie(idToken)

    return {
      success: true,
      message: "Login successful.",
    }
  } catch (error) {
    console.error("Sign-in error:", error)
    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    }
  }
}

// Sign out
export async function signOut() {
  const cookieStore = await cookies() // ✅ Await added here
  cookieStore.delete("session")
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies(); // ✅ MUST be awaited in App Router
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userDoc = await db.collection("users").doc(decodedClaims.uid).get();
    if (!userDoc.exists) return null;

    return {
      ...userDoc.data(),
      id: userDoc.id,
    } as User;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}


// Auth check
export const isAuthenticated = async (): Promise<boolean> => {
  const cookieStore = await cookies() // ✅ Await added here
  const sessionCookie = cookieStore.get("session")?.value
  if (!sessionCookie) return false

  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true)
    return !!decoded
  } catch {
    return false
  }
}
