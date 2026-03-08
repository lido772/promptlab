import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBHA4b-8tXrZrzkI_PNJwsyYoNLi0KDOoI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "promptup-fedad.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "promptup-fedad",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "promptup-fedad.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "511896531795",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:511896531795:web:40a6de61c573073d0ae7a6",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://promptup-fedad-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database };
