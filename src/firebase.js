// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
// אם תרצה אנליטיקס בהמשך:
// import { getAnalytics } from "firebase/analytics";

// === הקונפיג שלך בדיוק כפי שסיפקת ===
const firebaseConfig = {
  apiKey: "AIzaSyA_gdKvRRlllPu5ivzj_DgvdJ_1gbgzG1A",
  authDomain: "teameter-562a1.firebaseapp.com",
  projectId: "teameter-562a1",
  storageBucket: "teameter-562a1.firebasestorage.app",
  messagingSenderId: "1061485896783",
  appId: "1:1061485896783:web:869c2875682fa24cb0763a",
  measurementId: "G-0WWWS7X7SJ"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// עבודה גם בלי אינטרנט — מסתנכרן כשחוזרים
enableIndexedDbPersistence(db).catch(() => {});

// אם תרצה להפעיל אנליטיקס (לא חובה, אפשר להשאיר כבוי כדי להימנע מאזהרות):
// const analytics = getAnalytics(app);
