'use client'
import { motion } from "motion/react"
import { getColors } from "../../lib/theme"
import { useAuth } from "../AuthProvider"

export default function SessionOverScreen({ isDark, puzzlesCompleted, incorrectGuesses }) {
  const { bg, text, dimmed } = getColors(isDark)
  const { user, signInWithGoogle } = useAuth()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: bg }}
    >
      <div className="flex flex-col items-center gap-6 text-center px-8">
        <div className="flex flex-col gap-2">
          <span style={{ color: text }} className="text-2xl">
            {puzzlesCompleted} / 5 puzzles solved
          </span>
          {!user && (
            <span style={{ color: text }} className="text-md">
              <a className="underline cursor-pointer" onClick={signInWithGoogle}>Sign in</a>{" to save progress"}
            </span>
          )}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{ border: `1px solid ${text}`, color: text }}
          className="mt-2 px-6 py-2 text-sm tracking-widest uppercase rounded hover:opacity-60 transition-opacity active:scale-95"
        >
          Play Again
        </button>
      </div>
    </motion.div>
  )
}
