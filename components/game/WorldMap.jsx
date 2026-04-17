import { useState, useEffect, useRef } from "react"
import { useMotionValue, animate } from "motion/react"
import { ComposableMap, Geography, Geographies, ZoomableGroup } from "react-simple-maps"
import CareerPath from "./CareerPath"
import { lerpColor } from "../../lib/color"
import { getColors } from "../../lib/theme"
import { useMapPan } from "../../lib/hooks/useMapPan"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function WorldMap({ isDark, isDragging, onMoveStart, onMoveEnd, revealedStops, puzzleIndex, currentStop, guessResult, panTarget }) {
  const { bg, bgHover, stroke, darkBlue, lightBlue } = getColors(isDark)

  const strokeMV = useMotionValue(stroke)
  const [strokeColor, setStrokeColor] = useState(stroke)
  useEffect(() => strokeMV.on("change", v => setStrokeColor(v)), [])
  const prevGuessResult = useRef(null)

  useEffect(() => {
    const prev = prevGuessResult.current
    prevGuessResult.current = guessResult
    const target = guessResult === 'wrong' ? "#ef4444"
      : guessResult === 'correct' ? "#22c55e"
      : stroke
    const duration = guessResult === 'correct' ? 0.7 : prev === 'correct' ? 0.5 : 0.2
    animate(strokeMV, target, { duration, ease: "easeOut" })
  }, [guessResult, stroke])

  const total = revealedStops.length
  const countryFills = {}
  revealedStops.forEach((stop, i) => {
    const t = total <= 1 ? 1 : i / (total - 1)
    countryFills[stop.countryCode] = lerpColor(darkBlue, lightBlue, t)
  })

  const [pinnedStop, setPinnedStop] = useState(null)

  useEffect(() => { setPinnedStop(null) }, [puzzleIndex])

  const { center, zoom, handleMoveStart, handleMoveEnd, handleWheel, panTo } = useMapPan({ revealedStops, puzzleIndex, panTarget })

  return (
    <div style={{ width: "100%", height: "100%" }} onClick={() => setPinnedStop(false)} onWheel={handleWheel}>
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
        filterZoomEvent={(e) => e.type !== "wheel" && e.type !== "touchstart"}
        onMoveStart={() => { handleMoveStart(); onMoveStart() }}
        onMoveEnd={(e) => { handleMoveEnd(e); onMoveEnd() }}
      >
        <g
          filter={guessResult === 'correct' ? "url(#glow-green)" : undefined}
          style={{ transition: "filter 0.4s ease" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fill = countryFills[String(geo.id)] ?? bg
                const fillHover = countryFills[String(geo.id)] ?? bgHover
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill, stroke: strokeColor, strokeWidth: 0.5, outline: "none" },
                      hover:   { fill: fillHover, stroke: strokeColor, strokeWidth: 0.5, outline: "none" },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </g>

        {/* key={puzzleIndex} forces CareerPath to remount on puzzle change,
            which resets its seenIndices ref so stop animations replay */}
        <CareerPath
          key={puzzleIndex}
          stops={revealedStops}
          isDark={isDark}
          currentStop={currentStop}
          onPanTo={panTo}
          pinnedStop={pinnedStop}
          setPinnedStop={setPinnedStop}
        />
      </ZoomableGroup>
    </ComposableMap>
    </div>
  )
}
