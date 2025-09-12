// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  // persistentLocalCache,               // ⛔️ מכבים כרגע כדי לעקוף את השגיאה
  // persistentMultipleTabManager,
  memoryLocalCache,                     // ✅ פתרון יציב ללא IndexedDB
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8L396tOd0Gh7DhB7ekz1qF8BqVoVZ5XE",
  authDomain: "teameter-562a1.firebaseapp.com",
  projectId: "teameter-562a1",
  storageBucket: "teameter-562a1.firebasestorage.app",
  messagingSenderId: "1061485896783",
  appId: "1:1061485896783:web:869c2875682fa24cb0763a",
};

export const app = initializeApp(firebaseConfig);

// ✅ מפעילים Firestore עם קאש בזיכרון בלבד (ללא IndexedDB).
// זה עוקף את ה-INTERNAL ASSERTION שנתקלנו בו בפרודקשן.
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});

/*
אם נרצה להחזיר אופליין בהמשך, נבדוק שהבעיה נעלמה ואז נעבור חזרה ל:
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
*/
