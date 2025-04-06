// firebase-config.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getDatabase } from 'firebase/database'

// Use your existing Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  // Add Realtime Database URL - you'll need to add this to your .env file
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://provet-calapan-3bc89-default-rtdb.asia-southeast1.firebasedatabase.app/'
};

// Initialize Firebase only once
let firebaseApp;
let auth;
let db;
let storage;
let rtdb;

try {
  // Check if Firebase app is already initialized
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  }

  // Initialize services
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
  rtdb = getDatabase(firebaseApp);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { firebaseApp, auth, db, storage, rtdb };