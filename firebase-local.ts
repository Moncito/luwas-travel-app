import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "./serviceAccountKey.json"; // place your new JSON key here

initializeApp({
  credential: cert(serviceAccount as any),
});

const db = getFirestore();

console.log("✅ Firebase Admin connected successfully.");
