// lib/admin/fetchMetrics.ts
import { db } from "@/firebase/admin";

export async function fetchAdminMetrics() {
  const usersSnapshot = await db.collection("users").get();
  const tripsSnapshot = await db.collection("destinations").get();

  const totalUsers = usersSnapshot.size;
  const totalTrips = tripsSnapshot.size;

  const pendingApprovals = tripsSnapshot.docs.filter(doc => {
    const data = doc.data();
    return data.status === "pending"; // optional if you track approval status
  }).length;

  return {
    totalUsers,
    totalTrips,
    pendingApprovals,
  };
}
