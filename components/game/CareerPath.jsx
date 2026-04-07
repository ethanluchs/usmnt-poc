'use client'
import { useMapContext } from "react-simple-maps"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect, useRef } from "react"
import StopCard from "./StopCard"

// stop shape: { order, club, country, lat, lng, years }

export default function CareerPath({ stops = [], isDark }) {
  const { projection } = useMapContext()
  const [hoveredStop, setHoveredStop] = useState(null)
  const [pinnedStop, setPinnedStop] = useState(null)
  const activeStop = pinnedStop ?? hoveredStop
  const seenIndices = useRef(new Set())

  const handleBackgroundClick = () => setPinnedStop(null)

  useEffect(() => {
    if (stops.length === 0) return
    const last = stops[stops.length - 1]
    const pt = projection([last.lng, last.lat])
    const t = setTimeout(() => setPinnedStop({ stop: last, x: pt[0], y: pt[1] }), 450)
    return () => clearTimeout(t)
  }, [stops.length])

  if (stops.length === 0) return null

  const points = stops.map(stop => projection([stop.lng, stop.lat]))
  const color = isDark ? "#ede8d0" : "#000000"
  const accent = color

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
            stroke={accent}
            strokeWidth={1}
            strokeDasharray="4 3"
            initial={!seenIndices.current.has(i) ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "anticipate" }}
          />
        )
      })}

      {points.map((pt, i) => (
        <g key={`stop-${i}`}>
          <motion.circle
            cx={pt[0]} cy={pt[1]}
            r={pinnedStop?.stop === stops[i] ? 4.5 : 3}
            fill={color}
            stroke={accent}
            strokeWidth={1}
            initial={!seenIndices.current.has(i) ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            onAnimationComplete={() => seenIndices.current.add(i)}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHoveredStop({ stop: stops[i], x: pt[0], y: pt[1] })}
            onMouseLeave={() => setHoveredStop(null)}
            onClick={() => setPinnedStop(prev => prev?.stop === stops[i] ? null : { stop: stops[i], x: pt[0], y: pt[1] })}
          />
          <motion.text
            x={pt[0]} y={pt[1] + 1.5}
            fontSize={pinnedStop?.stop === stops[i] ? 5.5 : 4}
            fill={isDark ? "#000000" : "#ede8d0"}
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
