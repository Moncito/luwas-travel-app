import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

console.log("🔍 Firebase Config Debug:");
console.log("FIREBASE_PROJECT_ID:", projectId);
console.log("FIREBASE_CLIENT_EMAIL:", clientEmail);
console.log("FIREBASE_PRIVATE_KEY exists:", !!privateKey);

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("❌ Firebase environment variables are missing.");
}

if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      }),
    });
    console.log("✅ Firebase Admin initialized.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin:", error);
    throw error;
  }
}

export const db = getFirestore();
