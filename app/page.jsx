'use client'
import React from "react"
import { ComposableMap, Geography, Geographies, ZoomableGroup } from "react-simple-maps"

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

//Need the gam
export default function Home() {
  return (
    <main className="w-screen h-screen bg-[#ede8d0]">
      <ComposableMap projection="geoMercator" width={800} height={450} style={{ width: "100%", height: "100%" }}>
        <ZoomableGroup center={[0, 0]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: "#ede8d0", stroke: "#000000", strokeWidth: 0.5 },
                    hover: { fill: "#e0dbbf", stroke: "#0", strokeWidth: "0.5" },
                  }}
                />
              ))}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </main>
  )
}
