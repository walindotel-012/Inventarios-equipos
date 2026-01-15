import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Reemplaza con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDISgwREfbDOU1sB448sU5TW6ZUHLy0i_A",
  authDomain: "inventario-equipos-d1553.firebaseapp.com",
  projectId: "inventario-equipos-d1553",
  storageBucket: "inventario-equipos-d1553.firebasestorage.app",
  messagingSenderId: "581733770014",
  appId: "1:581733770014:web:4135c37f92480c5983df0f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Microsoft OAuth Provider
export const microsoftProvider = new OAuthProvider('microsoft.com');

// Initialize Firestore
export const db = getFirestore(app);
