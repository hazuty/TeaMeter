// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// === הקונפיג שלך (בדיוק כפי שסיפקת) ===
const firebaseConfig = {
  apiKey: "AIzaSyA_gdKvRRlllPu5ivzj_DgvdJ_1gbgzG1A",
  authDomain: "teameter-562a1.firebaseapp.com",
  projectId: "teameter-562a1",
  storageBucket: "teameter-562a1.firebasestorage.app",
  messagingSenderId: "1061485896783",
  appId: "1:1061485896783:web:869c2875682fa24cb0763a",
  // measurementId לא חובה לסנכרון; אפשר להשאיר מחוץ לקובץ
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// אופציונלי: עבודה גם כשהמכשיר אופליין (מסתנכרן כשחוזרים)
enableIndexedDbPersistence(db).catch(() => {});
