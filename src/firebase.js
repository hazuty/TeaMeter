// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// הדבק כאן את ה-config שלך מה-Firebase Console
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// כניסה אנונימית (כדי לא לדרוש התחברות)
const auth = getAuth(app);
signInAnonymously(auth).catch(console.error);
