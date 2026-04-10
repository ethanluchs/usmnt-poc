'use client'
import { motion } from "motion/react"
import { getColors } from "../../lib/theme"

export default function StopCard({ stop, x, y, isDark }) {
  if (!stop) return null
  const { cardBg, stroke, text } = getColors(isDark)

  return (
    <foreignObject x={x + 6} y={y - 28} width={90} height={50} style={{ overflow: "visible" }}>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{
          background: cardBg,
          border: `1px solid ${stroke}`,
          color: text,
          padding: "4px 7px",
          fontSize: "5px",
          lineHeight: 1.7,
          whiteSpace: "normal",
          maxWidth: "90px",
          pointerEvents: "none",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: "3px", right: "5px", fontSize: "5px", fontWeight: "bold" }}>#{stop.order}</div>
        <div style={{ fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", paddingRight: "10px" }}>{stop.club}</div>
        <div style={{ opacity: 0.5 }}>{stop.years}</div>
      </motion.div>
    </foreignObject>
  )
}
