import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyAUEbZmesvFJu8qe4Yy2isHe-0_HS1Yi9s",
authDomain: "luwas-966e2.firebaseapp.com",
projectId: "luwas-966e2",
storageBucket: "luwas-966e2.firebasestorage.app",
messagingSenderId: "1030258873457",
appId: "1:1030258873457:web:4d489e4a65048a829d77d0",
measurementId: "G-MTE0777XK0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);