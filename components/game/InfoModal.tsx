"use client";
import { motion } from "motion/react";
import { MOCK_PLAYERS } from "../../lib/mockData";

interface InfoModalProps {
  onClose: () => void;
}

export default function InfoModal({ onClose }: InfoModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#ede8d0", border: "1px solid #000000", color: "#000000" }}
        className="p-6 w-[340px] max-h-[80vh] overflow-y-auto flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <span className="text-lg tracking-widest uppercase">How to Play</span>
          <button onClick={onClose} className="text-xl leading-none opacity-40 hover:opacity-100 transition-opacity">✕</button>
        </div>

        <ol className="flex flex-col gap-2 text-sm">
          <li>1. Career stops are revealed one at a time on the map.</li>
          <li>2. Guess the player from the list below after each stop.</li>
          <li>3. Wrong guesses are recorded — try to guess in as few stops as possible.</li>
          <li>4. You get 5 puzzles per session.</li>
        </ol>

        <hr style={{ borderColor: "#000000", opacity: 0.3 }} />

        <div className="flex flex-col gap-2">
          <span className="text-xs tracking-widest uppercase opacity-60">Player Pool</span>
          <ul className="flex flex-col gap-1">
            {MOCK_PLAYERS.map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <span className="opacity-60">{p.nationality} · {p.position}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
