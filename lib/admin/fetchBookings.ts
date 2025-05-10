// lib/admin/fetchBookings.ts
"use server";

import { db } from "@/firebase/admin";

export async function getAllBookings() {
  const snapshot = await db.collection("bookings").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
