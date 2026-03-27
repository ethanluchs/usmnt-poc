// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4990AGmZgU8JEcieJnvFZp23RiICGVfg",
  authDomain: "soccerguesser-3eb7e.firebaseapp.com",
  projectId: "soccerguesser-3eb7e",
  storageBucket: "soccerguesser-3eb7e.firebasestorage.app",
  messagingSenderId: "109688140602",
  appId: "1:109688140602:web:5600274310213ce44f9603",
  measurementId: "G-2G6S2DJ6KW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the services so you can use them throughout your app
export { app, auth, db, storage };
