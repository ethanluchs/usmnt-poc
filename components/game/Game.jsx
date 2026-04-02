'use client'
import React, { useState } from "react"
import { ComposableMap, Geography, Geographies, ZoomableGroup } from "react-simple-maps"
import BottomBar from "./BottomBar"

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

export default function Game() {
  const [isDragging, setIsDragging] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(prev => {
      document.documentElement.classList.toggle("dark", !prev);
      return !prev;
    });
  };

  const tan = isDark ? "#000000" : "#ede8d0";
  const tanHover = isDark ? "#1a1a1a" : "#e0dbbf";
  const stroke = isDark ? "#ede8d0" : "#000000";

  return (
    <main className="relative w-screen h-screen bg-[#ede8d0] dark:bg-black">

      //Top div w title+theme switcher
      <div className="absolute top-0 left-0 right-0 flex justify-center items-center py-4 z-10 gap-3">
        <h1 className="text-2xl tracking-widest uppercase text-black dark:text-[#ede8d0]">Wordle Cup</h1>
        <button onClick={toggleTheme} className="flex items-center justify-center text-black dark:text-[#ede8d0] transition-colors">
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>

    //Map 
      <ComposableMap projection="geoMercator"
      width={800} height={450}
      style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}>
        <ZoomableGroup center={[0, 0]} zoom={2} minZoom={1} maxZoom={7} translateExtent={[[-25, -125], [850, 550]]}
          onMoveStart={() => setIsDragging(true)}
          onMoveEnd={() => setIsDragging(false)}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: tan, stroke: stroke, strokeWidth: 0.5, outline: "none" },
                    hover: { fill: tanHover, stroke: stroke, strokeWidth: 0.5, outline: "none" },
                    touchAction: "none"
                  }}
                />
              ))}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      //Bottom bar contains most other stuff
      <BottomBar />
    </main>
  )
}
