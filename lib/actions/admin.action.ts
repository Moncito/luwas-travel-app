"use server"

import { db } from "@/firebase/admin"

export async function fetchTotalUsers() {
  const snapshot = await db.collection("users").get()
  return snapshot.size
}
