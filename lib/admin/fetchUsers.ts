// lib/admin/fetchUsers.ts
import { db } from "@/firebase/admin";

export async function fetchAllUsers() {
  const snapshot = await db.collection("users").get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
