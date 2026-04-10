import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, query, where } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBA9_IHFWLa2CghMa-Pvp7T-MI3_eHTmBE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ieee-psit.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://ieee-psit-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ieee-psit",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ieee-psit.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "443971304218",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:443971304218:web:7f1327ee742164a6164aa3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-P6BXPEZBMS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
