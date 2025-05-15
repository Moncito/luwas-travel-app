// firebase/client.ts

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAUEbZmesvFJu8qe4Yy2isHe-0_HS1Yi9s",
  authDomain: "luwas-966e2.firebaseapp.com",
  projectId: "luwas-966e2",
  storageBucket: "luwas-966e2.appspot.com", // ✅ corrected .app to .com
  messagingSenderId: "1030258873457",
  appId: "1:1030258873457:web:4d489e4a65048a829d77d0",
  measurementId: "G-MTE0777XK0"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);       // ✅ This was missing
export const storage = getStorage(app);
