import { db } from "@/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

async function backfillCreatedAt() {
  try {
    const collections = ["bookings", "itineraryBookings"];

    for (const col of collections) {
      console.log(`🔎 Checking collection: ${col}...`);

      const snapshot = await db.collection(col).get();
      let updated = 0;

      for (const doc of snapshot.docs) {
        const data = doc.data();

        // Skip if already has createdAt
        if (data.createdAt) continue;

        // Use Firestore's internal updateTime as fallback
        const fallbackDate =
          doc.updateTime?.toDate?.() || new Date();

        await doc.ref.update({
          createdAt: Timestamp.fromDate(fallbackDate),
        });

        updated++;
      }

      console.log(`✅ Backfilled ${updated} docs in ${col}`);
    }

    console.log("🎉 Backfill complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error in backfill:", err);
    process.exit(1);
  }
}

backfillCreatedAt();
