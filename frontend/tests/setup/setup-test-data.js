// This script will help you set up test data in Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
// Try to find the .env file by going up directories until we find it
let currentDir = __dirname;
let envPath;
while (currentDir !== resolve(currentDir, '..')) {
  envPath = resolve(currentDir, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
  currentDir = resolve(currentDir, '..');
}

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Log the config for debugging (remove sensitive info in production)
console.log('Using Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create test users if needed
async function createTestSession() {
  try {
    // Current time
    const now = new Date();
    
    // Create a session 10 minutes from now (so it's joinable)
    const sessionTime = new Date(now.getTime() + 10 * 60000);
    
    const sessionData = {
      title: "Test Telehealth Session",
      scheduledTime: Timestamp.fromDate(sessionTime),
      patientId: "test-patient-id", // Replace with actual test user ID
      patientName: "Test Patient",
      doctorId: "test-doctor-id", // Replace with actual test doctor ID
      doctorName: "Dr. Test Veterinarian",
      petName: "Fluffy",
      petType: "Cat",
      status: "scheduled",
      createdAt: Timestamp.fromDate(now)
    };
    
    const docRef = await addDoc(collection(db, "telehealth_sessions"), sessionData);
    console.log("Test session created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating test session:", error);
  }
}

// Run the function
createTestSession();