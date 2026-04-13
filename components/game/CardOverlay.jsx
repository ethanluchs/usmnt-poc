'use client'
import { motion, AnimatePresence } from "motion/react"
export default function CardOverlay({ isDark, isOpen, onClose, unlockedCards = [] }) {

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`relative w-[90vw] max-w-xl rounded-2xl p-6 ${isDark ? "bg-[#1a1917]/30" : "bg-[#ede8d0]/30"} backdrop-blur-md shadow-xl`}
            onClick={e => e.stopPropagation()}
          >
            {/* cards */}
            {unlockedCards.length === 0 && (
              <p className="text-sm text-center py-6 tracking-wide text-white">
                No cards!
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
