import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDM3nU5ifIk5wF3kcdToVWpjDD6U5VP5Jk",
  authDomain: "facepet-48b13.firebaseapp.com",
  projectId: "facepet-48b13",
  storageBucket: "facepet-48b13.firebasestorage.app",
  messagingSenderId: "1055059508691",
  appId: "1:1055059508691:web:f530c111ec812d4e9f4326",
  measurementId: "G-ML6XD5X9C2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (only in browser) - Disabled for localhost development
// export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const analytics = null; // Temporarily disabled to avoid 403 errors on localhost

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Uncomment these if you want to use Firebase emulators for local development
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

console.log('🔥 Firebase initialized successfully');
