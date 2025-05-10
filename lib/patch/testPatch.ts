import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

// 🔐 Initialize Firebase Admin
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

async function patchDestinationsWithCreatedAt() {
  const snapshot = await db.collection('destinations').get();
  let patched = 0;

  const updates = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    if (!data.createdAt) {
      await doc.ref.update({
        createdAt: FieldValue.serverTimestamp(),
      });
      patched++;
    }
  });

  await Promise.all(updates);
  console.log(`✅ Patched ${patched} destinations.`);
}

patchDestinationsWithCreatedAt();
