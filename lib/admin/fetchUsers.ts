// lib/admin/fetchUsers.ts
import { db } from "@/firebase/admin";
import { AppUser } from "@/types/User";
export async function fetchAllUsers(): Promise<AppUser[]> {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AppUser[];
}
