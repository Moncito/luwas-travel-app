// lib/admin/fetchUsers.ts
import { db } from "@/firebase/admin";

export async function fetchAllUsers() {
  const snapshot = await db.collection("users").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : null,
      updatedAt: data.updatedAt?.toDate
        ? data.updatedAt.toDate().toISOString()
        : null,
      lastLoginAt: data.lastLoginAt?.toDate
        ? data.lastLoginAt.toDate().toISOString()
        : null, // ✅ added this line
    };
  });
}
