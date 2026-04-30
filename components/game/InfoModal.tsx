"use client";
import { motion } from "motion/react";
import { MOCK_PLAYERS } from "../../lib/mockData";

interface InfoModalProps {
  isDark: boolean;
  onClose: () => void;
}

export default function InfoModal({ isDark, onClose }: InfoModalProps) {
  const bg = isDark ? "#1a1917" : "#ffffff";
  const border = isDark ? "#b8b2a0" : "#000000";
  const text = isDark ? "#b8b2a0" : "#000000";
  const dimText = isDark ? "#6b6660" : "#888";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: isDark ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: bg, border: `1px solid ${border}`, color: text }}
        className="rounded-lg p-6 w-[340px] max-h-[80vh] overflow-y-auto flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <span style={{ color: text }} className="text-lg tracking-widest uppercase">
            How to Play
          </span>
          <button onClick={onClose} style={{ color: dimText }} className="text-xl leading-none hover:opacity-60 transition-opacity">
            ✕
          </button>
        </div>

        <ol className="flex flex-col gap-2 text-sm" style={{ color: text }}>
          <li>1. Career stops are revealed one at a time on the map.</li>
          <li>2. Guess the player from the list below after each stop.</li>
          <li>3. Wrong guesses are recorded — try to guess in as few stops as possible.</li>
          <li>4. You get 5 puzzles per session.</li>
        </ol>

        <hr style={{ borderColor: border, opacity: 0.3 }} />

        <div className="flex flex-col gap-2">
          <span style={{ color: dimText }} className="text-xs tracking-widest uppercase">
            Player Pool
          </span>
          <ul className="flex flex-col gap-1">
            {MOCK_PLAYERS.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span style={{ color: text }}>{p.name}</span>
                <span style={{ color: dimText }}>{p.nationality} · {p.position}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
