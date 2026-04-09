'use client'
import { useMapContext } from "react-simple-maps"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect, useRef } from "react"
import StopCard from "./StopCard"

// stop shape: { order, club, country, lat, lng, years }

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

function lerpColor(hexA, hexB, t) {
  const [r1, g1, b1] = hexToRgb(hexA)
  const [r2, g2, b2] = hexToRgb(hexB)
  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)
  return `rgb(${r},${g},${b})`
}

export default function CareerPath({ stops = [], isDark, currentStop, onPanTo }) {
  const { projection } = useMapContext()
  const [hoveredStop, setHoveredStop] = useState(null)
  const [pinnedStop, setPinnedStop] = useState(null)
  const activeStop = pinnedStop ?? hoveredStop
  const seenIndices = useRef(new Set())

  const darkBlue  = isDark ? "#1a4a6e" : "#0d2e4a"
  const lightBlue = isDark ? "#7ec8e3" : "#4a9bbf"
  const totalStops = stops.length
  // earliest stop = darkest, most recent = lightest
  const lineColor = (i) => lerpColor(darkBlue, lightBlue, totalStops <= 1 ? 1 : (i + 0.5) / (totalStops - 1))

  const handleBackgroundClick = () => setPinnedStop(null)

  useEffect(() => {
    if (stops.length === 0 || currentStop === 0) return
    const last = stops[stops.length - 1]
    const pt = projection([last.lng, last.lat])
    const t = setTimeout(() => setPinnedStop({ stop: last, x: pt[0], y: pt[1] }), 450)
    return () => clearTimeout(t)
  }, [stops.length])

  if (stops.length === 0) return null

  const points = stops.map(stop => projection([stop.lng, stop.lat]))

  return (
    <g>

      {pinnedStop && <rect x={-10000} y={-10000} width={20000} height={20000} fill="transparent" onClick={handleBackgroundClick} />}
      {points.slice(0, -1).map((pt, i) => {
        const next = points[i + 1]

        const cx = (pt[0] + next[0]) / 2
        const cy = (pt[1] + next[1]) / 2 - Math.hypot(next[0] - pt[0], next[1] - pt[1]) * 0.3 //claude cooked what is this
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
            fill={isDark ? "#b8b2a0" : "#1a1917"}
            stroke={isDark ? "#b8b2a0" : "#1a1917"}
            strokeWidth={1}
            initial={!seenIndices.current.has(i) ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            onAnimationComplete={() => seenIndices.current.add(i)}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoveredStop({ stop: stops[i], x: pt[0], y: pt[1] })}
            onMouseLeave={() => setHoveredStop(null)}
            onClick={() => {
              setPinnedStop(prev => prev?.stop === stops[i] ? null : { stop: stops[i], x: pt[0], y: pt[1] })
              onPanTo?.(stops[i].lng, stops[i].lat)
            }}
          />
          <motion.text
            x={pt[0]} y={pt[1] + 1.5}
            fontSize={pinnedStop?.stop === stops[i] ? 5.5 : 4}
            fill={isDark ? "#1a1917" : "#ede8d0"}
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
