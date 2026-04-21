"use client";

import React from "react";
import { useAuth } from "./AuthProvider";

export default function Login() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div className="flex flex-col items-center">
          {user.photoURL && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt={user.displayName || "avatar"}
              className="w-16 h-16 rounded-full"
            />
          )}
          <p className="mt-2">{user.displayName || user.email}</p>
          <button
            onClick={() => signOut()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-4">Sign in to sync your player cards across devices.</p>
          <button
            onClick={() => signInWithGoogle()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}
