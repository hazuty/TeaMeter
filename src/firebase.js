// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  // memoryLocalCache, // אם תרצה לבטל אופליין – החלף לשורה הזו
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

// אופליין (API חדש, בלי האזהרת deprecation)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// אם לא רוצים אופליין בכלל:
// export const db = initializeFirestore(app, { localCache: memoryLocalCache() });
