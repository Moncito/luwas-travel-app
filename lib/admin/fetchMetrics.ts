// lib/admin/fetchMetrics.ts
import { db } from "@/firebase/admin";

export async function fetchAdminMetrics() {
  const usersSnapshot = await db.collection("users").get();
  const totalUsers = usersSnapshot.size;

  // Placeholder values until we implement trips and approvals
  const totalTrips = 0;
  const pendingApprovals = 0;

  return {
    totalUsers,
    totalTrips,
    pendingApprovals,
  };
}
