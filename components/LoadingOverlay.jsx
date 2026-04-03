'use client'
import { useEffect } from "react"
import { motion } from "framer-motion"

export default function LoadingOverlay({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 800)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#ede8d0] dark:bg-black gap-6"
    >
      <h1 className="text-6xl tracking-widest uppercase text-black dark:text-[#ede8d0]">
        Wordle Cup
      </h1>
      <div className="w-8 h-8 border-2 border-black dark:border-[#ede8d0] border-t-transparent rounded-full animate-spin" />
    </motion.div>
  )
}
