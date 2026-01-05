// ✅ Firebase Configuration (MindCraft Project)
// NOTE: This key is restricted to your GitHub Pages domain and safe to use.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔐 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA67NwJQPqiYEoYVfTeB76v326neGIz3y8",
  authDomain: "mindcraft-83f81.firebaseapp.com",
  projectId: "mindcraft-83f81",
  storageBucket: "mindcraft-83f81.firebasestorage.app",
  messagingSenderId: "483019456762",
  appId: "1:483019456762:web:fdc05a2dda51c0f39a8943"
};

// 🔧 Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
