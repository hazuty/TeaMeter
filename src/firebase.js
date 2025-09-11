// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_gdKvRRlllPu5ivzj_DgvdJ_1gbgzG1A",
  authDomain: "teameter-562a1.firebaseapp.com",
  projectId: "teameter-562a1",
  storageBucket: "teameter-562a1.firebasestorage.app",
  messagingSenderId: "1061485896783",
  appId: "1:1061485896783:web:869c2875682fa24cb0763a",
  measurementId: "G-0WWWS7X7SJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);