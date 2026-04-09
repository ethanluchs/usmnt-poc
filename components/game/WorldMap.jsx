import { useState, useEffect } from "react"
import { useMotionValue, useSpring, useMotionValueEvent } from "motion/react"
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

export default function WorldMap({ isDark, isDragging, onMoveStart, onMoveEnd, revealedStops, puzzleIndex, currentStop }) {
  const tan = isDark ? "#1a1917" : "#ede8d0"
  const tanHover = isDark ? "#242220" : "#e0dbbf"
  const stroke = isDark ? "#b8b2a0" : "#000000"

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
  const targetLng = useMotionValue(0)
  const targetLat = useMotionValue(10)
  const springLng = useSpring(targetLng, { stiffness: 50, damping: 18 })
  const springLat = useSpring(targetLat, { stiffness: 50, damping: 18 })

  useMotionValueEvent(springLng, "change", () => {
    setCenter([springLng.get(), springLat.get()])
  })

  useEffect(() => {
    if (revealedStops.length === 0) return
    const last = revealedStops[revealedStops.length - 1]
    targetLng.set(last.lng)
    targetLat.set(last.lat)
  }, [revealedStops.length])

  return (
    <ComposableMap
      projection="geoMercator"
      width={800}
      height={450}
      style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      <ZoomableGroup
        center={center} zoom={2} minZoom={1} maxZoom={7}
        translateExtent={[[-25, -125], [850, 550]]}
        onMoveStart={() => {
          // Snap target to current spring position so the spring stops fighting the user
          targetLng.set(springLng.get())
          targetLat.set(springLat.get())
          onMoveStart()
        }}
        onMoveEnd={onMoveEnd}
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
                    default: { fill, stroke, strokeWidth: 0.5, outline: "none" },
                    hover:   { fill: fillHover, stroke, strokeWidth: 0.5, outline: "none" },
                  }}
                />
              )
            })
          }
        </Geographies>

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
