import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Reemplaza con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDL2P7fgoKLOBkqepmsn0QM3cvVL16P1c4",
  authDomain: "inventario-equipos-f67f9.firebaseapp.com",
  projectId: "inventario-equipos-f67f9",
  storageBucket: "inventario-equipos-f67f9.firebasestorage.app",
  messagingSenderId: "1056879976158",
  appId: "1:1056879976158:web:3f8c86fcd91cee3b5aec4f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);
