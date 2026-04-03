import { ComposableMap, Geography, Geographies, ZoomableGroup } from "react-simple-maps"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function WorldMap({ isDark, isDragging, onMoveStart, onMoveEnd, revealedCountryCodes }) {
  const tan = isDark ? "#000000" : "#ede8d0"
  const tanHover = isDark ? "#1a1a1a" : "#e0dbbf"
  const stroke = isDark ? "#ede8d0" : "#000000"
  const highlight = isDark ? "#c0855a" : "#a85f35"
  const highlightHover = isDark ? "#d4996e" : "#bf7040"

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
            geographies.map((geo) => {
              const isRevealed = revealedCountryCodes?.has(geo.id)
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: isRevealed ? highlight : tan, stroke, strokeWidth: 0.5, outline: "none" },
                    hover:   { fill: isRevealed ? highlightHover : tanHover, stroke, strokeWidth: 0.5, outline: "none" },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  )
}
