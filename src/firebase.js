// src/firebase.js
// את הקובץ הזה מדביקים *בדיוק* כך ומחליפים את הקיים.

// Firebase core
import { initializeApp } from "firebase/app";

// Firestore – API החדש לאופליין/מטמון
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager, // אופציונלי – תמיכה במספר טאבים פתוחים
  // memoryLocalCache,            // אם תרצה לבטל אופליין ולהישאר בזיכרון בלבד
} from "firebase/firestore";

// ⚠️ זה המפתח החדש שנתת
const firebaseConfig = {
  apiKey: "AIzaSyC8L396tOd0Gh7DhB7ekz1qF8BqVoVZ5XE",
  authDomain: "teameter-562a1.firebaseapp.com",
  projectId: "teameter-562a1",
  storageBucket: "teameter-562a1.firebasestorage.app",
  messagingSenderId: "1061485896783",
  appId: "1:1061485896783:web:869c2875682fa24cb0763a",
};

export const app = initializeApp(firebaseConfig);

// הגדרת Firestore עם מטמון מתמשך (מחליף את enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(), // אפשר להסיר אם לא צריך ריבוי טאבים
  }),
});

// אם תרצה לבטל אופליין לחלוטין ולהסיר מטמון:
// export const db = initializeFirestore(app, { localCache: memoryLocalCache() });
