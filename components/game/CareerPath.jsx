'use client'
import { useMapContext } from "react-simple-maps"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect, useRef } from "react"
import StopCard from "./StopCard"
import { lerpColor } from "../../lib/color"
import { getColors } from "../../lib/theme"

export default function CareerPath({ stops = [], isDark, currentStop, onPanTo, pinnedStop, setPinnedStop }) {
  const { projection } = useMapContext()
  const [hoveredStop, setHoveredStop] = useState(null)
  const seenIndices = useRef(new Set())

  const { text, textInv, darkBlue, lightBlue } = getColors(isDark)
  const totalStops = stops.length
  const lineColor = (i) => lerpColor(darkBlue, lightBlue, totalStops <= 1 ? 1 : (i + 0.5) / (totalStops - 1))

  useEffect(() => {
    if (stops.length === 0 || currentStop === 0) return
    const last = stops[stops.length - 1]
    const pt = projection([last.lng, last.lat])
    const t = setTimeout(() => setPinnedStop({ stop: last, x: pt[0], y: pt[1] }), 450)
    return () => clearTimeout(t)
  }, [stops.length])

  if (stops.length === 0) return null

  const points = stops.map(stop => projection([stop.lng, stop.lat]))
  const activeStop = pinnedStop || hoveredStop || (pinnedStop !== false ? { stop: stops[0], x: points[0][0], y: points[0][1] } : null)

  return (
    <g>
      {points.slice(0, -1).map((pt, i) => {
        const next = points[i + 1]
        const cx = (pt[0] + next[0]) / 2
        const cy = (pt[1] + next[1]) / 2 - Math.hypot(next[0] - pt[0], next[1] - pt[1]) * 0.3
        const d = `M ${pt[0]} ${pt[1]} Q ${cx} ${cy} ${next[0]} ${next[1]}`
        return (
          <motion.path
            key={`line-${i}`}
            d={d}
            fill="none"
            stroke={lineColor(i)}
            strokeWidth={1}
            strokeDasharray="4 3"
            initial={!seenIndices.current.has(i) ? { pathLength: 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ pathLength: { duration: 1.2, ease: "easeInOut" }, opacity: { duration: 0.3 } }}
          />
        )
      })}

      {points.map((pt, i) => (
        <g key={`stop-${i}`}>
          <motion.circle
            cx={pt[0]} cy={pt[1]}
            r={pinnedStop?.stop === stops[i] ? 4.5 : 3}
            fill={text}
            stroke={text}
            strokeWidth={1}
            initial={!seenIndices.current.has(i) ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            onAnimationComplete={() => seenIndices.current.add(i)}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoveredStop({ stop: stops[i], x: pt[0], y: pt[1] })}
            onMouseLeave={() => setHoveredStop(null)}
            onClick={(e) => {
              e.stopPropagation()
              setPinnedStop(prev => prev?.stop === stops[i] ? false : { stop: stops[i], x: pt[0], y: pt[1] })
              onPanTo?.(stops[i].lng, stops[i].lat)
            }}
          />
          <motion.text
            x={pt[0]} y={pt[1] + 1.5}
            fontSize={pinnedStop?.stop === stops[i] ? 5.5 : 4}
            fill={textInv}
            textAnchor="middle"
            initial={!seenIndices.current.has(i) ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1, ease: "easeOut", delay: 0.05 }}
            style={{ pointerEvents: "none", userSelect: "none", fontWeight: "bold" }}
          >
            {stops[i].order}
          </motion.text>
        </g>
      ))}

      <AnimatePresence>
        {activeStop && (
          <StopCard key={activeStop.stop.order} stop={activeStop.stop} x={activeStop.x} y={activeStop.y} isDark={isDark} />
        )}
      </AnimatePresence>
    </g>
  )
}
