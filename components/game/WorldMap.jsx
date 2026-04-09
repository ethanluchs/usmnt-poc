import { useState, useEffect, useRef } from "react"
import { useMotionValue, useSpring, useMotionValueEvent, animate } from "motion/react"
import { ComposableMap, Geography, Geographies, ZoomableGroup } from "react-simple-maps"
import CareerPath from "./CareerPath"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}
function lerpColor(hexA, hexB, t) {
  const [r1,g1,b1] = hexToRgb(hexA), [r2,g2,b2] = hexToRgb(hexB)
  return `rgb(${Math.round(r1+(r2-r1)*t)},${Math.round(g1+(g2-g1)*t)},${Math.round(b1+(b2-b1)*t)})`
}

export default function WorldMap({ isDark, isDragging, onMoveStart, onMoveEnd, revealedStops, puzzleIndex, currentStop, guessResult }) {
  const tan = isDark ? "#1a1917" : "#ede8d0"
  const tanHover = isDark ? "#242220" : "#e0dbbf"
  const baseStroke = isDark ? "#b8b2a0" : "#000000"

  const strokeMV = useMotionValue(baseStroke)
  const [strokeColor, setStrokeColor] = useState(baseStroke)
  useEffect(() => strokeMV.on("change", v => setStrokeColor(v)), [])
  const prevGuessResult = useRef(null)

  useEffect(() => {
    const prev = prevGuessResult.current
    prevGuessResult.current = guessResult
    const target = guessResult === 'wrong' ? "#ef4444"
      : guessResult === 'correct' ? "#22c55e"
      : baseStroke
    const duration = guessResult === 'correct' ? 0.7 : prev === 'correct' ? 0.5 : 0.2
    animate(strokeMV, target, {
      duration,
      ease: "easeOut",
    })
  }, [guessResult, baseStroke])

  const darkBlue  = isDark ? "#1a4a6e" : "#0d2e4a"
  const lightBlue = isDark ? "#7ec8e3" : "#4a9bbf"
  const total = revealedStops.length

  const countryFills = {}
  revealedStops.forEach((stop, i) => {
    const t = total <= 1 ? 1 : i / (total - 1)
    countryFills[stop.countryCode] = lerpColor(darkBlue, lightBlue, t)
  })

  // Spring-animated center for smooth auto-pan
  const [center, setCenter] = useState([0, 10])
  const [zoom, setZoom] = useState(2)
  const zoomRef = useRef(2)
  const targetLng = useMotionValue(0)
  const targetLat = useMotionValue(10)
  const springLng = useSpring(targetLng, { stiffness: 120, damping: 28 })
  const springLat = useSpring(targetLat, { stiffness: 120, damping: 28 })

  const actualCenter = useRef([0, 10])
  const hasDragged = useRef(false)

  useMotionValueEvent(springLng, "change", () => {
    const lng = springLng.get()
    const lat = springLat.get()
    setCenter([lng, lat])
    actualCenter.current = [lng, lat]
  })

  useEffect(() => {
    if (revealedStops.length === 0) return
    const last = revealedStops[revealedStops.length - 1]
    if (hasDragged.current) {
      const [curLng, curLat] = actualCenter.current
      targetLng.jump(curLng)
      targetLat.jump(curLat)
      springLng.jump(curLng)
      springLat.jump(curLat)
      hasDragged.current = false
    }
    setZoom(zoomRef.current)
    targetLng.set(last.lng)
    targetLat.set(last.lat)
  }, [revealedStops.length, puzzleIndex])

  return (
    <ComposableMap
      projection="geoMercator"
      width={800}
      height={450}
      style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      <defs>
        <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feFlood floodColor="#22c55e" floodOpacity="0.55" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ZoomableGroup
        center={center} zoom={zoom} minZoom={1} maxZoom={7}
        translateExtent={[[-25, -125], [850, 550]]}
        onMoveStart={() => {
          targetLng.jump(springLng.get())
          targetLat.jump(springLat.get())
          onMoveStart()
        }}
        onMoveEnd={({ coordinates, zoom: z }) => {
          actualCenter.current = coordinates
          zoomRef.current = z
          hasDragged.current = true
          onMoveEnd()
        }}
      >
        <g
          filter={guessResult === 'correct' ? "url(#glow-green)" : undefined}
          style={{ transition: "filter 0.4s ease" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fill = countryFills[String(geo.id)] ?? tan
                const fillHover = countryFills[String(geo.id)] ?? tanHover
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill, stroke: strokeColor, strokeWidth: 0.5, outline: "none", outline: "none" },
                      hover:   { fill: fillHover, stroke: strokeColor, strokeWidth: 0.5, outline: "none", outline: "none" },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </g>

        <CareerPath
          key={puzzleIndex}
          stops={revealedStops}
          isDark={isDark}
          currentStop={currentStop}
          onPanTo={(lng, lat) => { targetLng.set(lng); targetLat.set(lat) }}
        />
      </ZoomableGroup>
    </ComposableMap>
  )
}
