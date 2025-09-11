// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// ⚠️ בדיוק כפי שמופיע אצלך בקונסול (מהצילום שהבאת)
const firebaseConfig = {
  apiKey: "AIzaSyC8L396tOd0Gh7DhB7ekz1qF8BqVoVZ5XE",
  authDomain: "teameter-562a1.firebaseapp.com",
  projectId: "teameter-562a1",
  storageBucket: "teameter-562a1.firebasestorage.app",
  messagingSenderId: "1061485896783",
  appId: "1:1061485896783:web:869c2875682fa24cb0763a",
  // measurementId לא נדרש לסנכרון
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// אופציונלי: עבודה גם בלי אינטרנט; לא קריטי
enableIndexedDbPersistence(db).catch(() => {});
