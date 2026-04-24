"use client";
import { motion } from "motion/react";
import { useAuth } from "../AuthProvider";

interface SessionOverScreenProps {
  puzzlesCompleted: number;
  incorrectGuesses: number;
  totalPuzzles?: number;
}

export default function SessionOverScreen({ puzzlesCompleted }: SessionOverScreenProps) {
  const { user, signInWithGoogle } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "#ede8d0" }}
    >
      <div className="flex flex-col items-center gap-6 text-center px-8">
        <div className="flex flex-col gap-2">
          <span className="text-2xl" style={{ color: "#000000" }}>
            {puzzlesCompleted} / 5 puzzles solved
          </span>
          {!user && (
            <span className="text-md" style={{ color: "#000000" }}>
              <a className="underline cursor-pointer" onClick={signInWithGoogle}>
                Sign in
              </a>
              {" to save progress"}
            </span>
          )}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{ border: "1px solid #000000", color: "#000000" }}
          className="mt-2 px-6 py-2 text-sm tracking-widest uppercase hover:opacity-60 transition-opacity active:scale-95"
        >
          Play Again
        </button>
      </div>
    </motion.div>
  );
}
