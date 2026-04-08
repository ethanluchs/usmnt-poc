import { ComposableMap, Geography, Geographies, ZoomableGroup } from "react-simple-maps"
import CareerPath from "./CareerPath"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function WorldMap({ isDark, isDragging, onMoveStart, onMoveEnd, revealedStops, puzzleIndex, currentStop }) {
  const tan = isDark ? "#1a1917" : "#ede8d0"
  const tanHover = isDark ? "#242220" : "#e0dbbf"
  const stroke = isDark ? "#b8b2a0" : "#000000"

  return (
    <ComposableMap
      projection="geoMercator"
      width={800}
      height={450}
      style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      <ZoomableGroup
        center={[0, 0]} zoom={2} minZoom={1} maxZoom={7}
        translateExtent={[[-25, -125], [850, 550]]}
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill: tan, stroke, strokeWidth: 0.5, outline: "none" },
                  hover:   { fill: tanHover, stroke, strokeWidth: 0.5, outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* career path lines + stop markers */}
        <CareerPath key={puzzleIndex} stops={revealedStops} isDark={isDark} currentStop={currentStop} />
      </ZoomableGroup>
    </ComposableMap>
  )
}
