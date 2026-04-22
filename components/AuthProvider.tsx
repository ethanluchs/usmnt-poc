"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { AuthContextValue } from "../lib/types";

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        const saveProfile = async () => {
          try {
            await setDoc(
              doc(db, "users", u.uid),
              {
                uid: u.uid,
                displayName: u.displayName || null,
                email: u.email || null,
                photoURL: u.photoURL || null,
                lastSeen: serverTimestamp(),
              },
              { merge: true }
            );
          } catch (e) {
            console.error("Failed to write user profile to Firestore", e);
          }
        };
        saveProfile();
      }
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("signInWithGoogle error", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("signOut error", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export default AuthProvider;
