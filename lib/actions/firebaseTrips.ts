import { db } from "@/firebase/admin"; // Make sure this points to your Firestore instance

export async function getTrips() {
  const snapshot = await db.collection("trips").get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
