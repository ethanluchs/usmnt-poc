'use client'
import { useEffect } from "react"
import { motion } from "motion/react"

export default function PuzzleTransition({ puzzleNumber, totalPuzzles = 5, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.50 } }}
      transition={{ duration: 2.0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 1.0, type: "spring" }}
        className="text-[20vw] font-bold leading-none text-[#ede8d0]"
      >
        {puzzleNumber}
      </motion.span>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.0 }}
        className="text-[#ede8d0] tracking-widest uppercase text-sm opacity-60"
      >
        Puzzle {puzzleNumber} of {totalPuzzles}
      </motion.p>
    </motion.div>
  )
}
