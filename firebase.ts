import { initializeApp, FirebaseApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB4990AGmZgU8JEcieJnvFZp23RiICGVfg",
  authDomain: "soccerguesser-3eb7e.firebaseapp.com",
  projectId: "soccerguesser-3eb7e",
  storageBucket: "soccerguesser-3eb7e.firebasestorage.app",
  messagingSenderId: "109688140602",
  appId: "1:109688140602:web:5600274310213ce44f9603",
  measurementId: "G-2G6S2DJ6KW",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
