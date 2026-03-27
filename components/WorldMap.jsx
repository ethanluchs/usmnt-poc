"use client"

import { useState, useEffect, useRef } from "react"
import { ComposableMap, Geographies, Geography, Marker, Line, ZoomableGroup } from "react-simple-maps"

const GEO_URL     = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
const INIT_CENTER = [-10, 32]
const INIT_ZOOM   = 1

export default function WorldMap({ stops, revealedCount }) {
  const [position, setPosition] = useState({ coordinates: INIT_CENTER, zoom: INIT_ZOOM })
  const [tooltip, setTooltip]   = useState(null) // { stop, index, x, y }
  const wrapRef = useRef(null)

  // Ctrl/Cmd+wheel → zoom  |  plain wheel → pan
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    function onWheel(e) {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const factor = e.deltaY > 0 ? 0.9 : 1.1
        setPosition(p => ({ ...p, zoom: Math.min(Math.max(p.zoom * factor, 0.8), 12) }))
      } else {
        setPosition(p => ({
          zoom: p.zoom,
          coordinates: [
            p.coordinates[0] + (e.deltaX * 0.25) / p.zoom,
            p.coordinates[1] - (e.deltaY * 0.25) / p.zoom,
          ],
        }))
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const visibleStops = stops.slice(0, revealedCount)
  const latestIdx    = visibleStops.length - 1

  // Only label the most-recent occurrence of each city to avoid stacked text
  const latestCityIdx = {}
  visibleStops.forEach((stop, i) => { if (i > 0) latestCityIdx[stop.city] = i })
  const labeledIdx = new Set(Object.values(latestCityIdx))

  function handleLabelClick(e, stop, index) {
    e.stopPropagation()
    setTooltip(t => t?.index === index ? null : { stop, index, x: e.clientX, y: e.clientY })
  }

  return (
    <div ref={wrapRef} className="w-full h-full bg-[#0c1322]" style={{ cursor: "grab" }}
      onClick={() => setTooltip(null)}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130 }}
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <filter id="dotGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="arcGlow" x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={setPosition}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography key={geo.rsmKey} geography={geo}
                  fill="#1c2b3a" stroke="#28415a" strokeWidth={0.5}
                  style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                />
              ))
            }
          </Geographies>

          {/* Arc lines */}
          {visibleStops.slice(1).map((stop, i) => {
            const prev = visibleStops[i]
            const isLatestArc = i === latestIdx - 1
            return (
              <Line
                key={`arc-${i}-${revealedCount}`}
                from={[prev.lng, prev.lat]} to={[stop.lng, stop.lat]}
                stroke="#f43f5e" strokeWidth={1.6}
                strokeDasharray={isLatestArc ? "800" : "6 4"}
                strokeLinecap="round"
                className={isLatestArc ? "arc-new" : undefined}
                style={{ opacity: 0.75, filter: "url(#arcGlow)" }}
              />
            )
          })}

          {/* Markers */}
          {visibleStops.map((stop, i) => {
            const isFirst  = i === 0
            const isLatest = i === latestIdx
            const showLabel = !isFirst && labeledIdx.has(i)

            const above  = i % 2 === 1
            const clubW  = Math.max(stop.label.length, stop.city.length) * 5.4 + 14
            const ry     = above ? -31 : 10
            const yClub  = above ? -21 : 21
            const yCity  = above ? -12 : 30

            return (
              <Marker key={`m-${i}`} coordinates={[stop.lng, stop.lat]}>
                {isFirst && (
                  <>
                    <circle r={12} fill="none" stroke="#f43f5e" strokeWidth={1}
                      className="birthplace-ring" style={{ opacity: 0.5 }} />
                    <circle r={7} fill="none" stroke="#f43f5e" strokeWidth={1}
                      className="birthplace-ring" style={{ opacity: 0.7, animationDelay: "0.6s" }} />
                    <text textAnchor="middle" y={-14}
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: "700", fill: "#f43f5e" }}>
                      ?
                    </text>
                  </>
                )}

                {isLatest && !isFirst && (
                  <circle r={10} fill="none" stroke="#f43f5e" strokeWidth={1} opacity={0.3} />
                )}

                <circle r={isFirst ? 5 : 4.5} fill="#f43f5e" stroke="#0c1322" strokeWidth={2}
                  className={isLatest ? "dot-new" : undefined}
                  style={{ filter: "url(#dotGlow)" }} />

                {showLabel && (
                  <g
                    onClick={(e) => handleLabelClick(e, stop, i)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect x={-clubW / 2} y={ry} width={clubW} height={23} rx={5}
                      fill={tooltip?.index === i ? "rgba(244,63,94,0.18)" : "rgba(10,16,28,0.88)"}
                      stroke={tooltip?.index === i ? "rgba(244,63,94,0.7)" : "rgba(244,63,94,0.25)"}
                      strokeWidth={0.8} />
                    <text textAnchor="middle" y={yClub}
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "8.5px", fontWeight: "700", fill: "#f43f5e" }}>
                      {stop.label}
                    </text>
                    <text textAnchor="middle" y={yCity}
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "7px", fontWeight: "500", fill: "#94a3b8" }}>
                      {stop.city}
                    </text>
                  </g>
                )}
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-30 pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y, transform: "translateY(-50%)" }}
        >
          <div className="bg-[#0c1322]/95 border border-white/15 rounded-xl px-3 py-2.5 shadow-2xl backdrop-blur-sm"
            style={{ fontFamily: "Inter, sans-serif" }}>
            <p className="text-sm font-bold text-white leading-tight">{tooltip.stop.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{tooltip.stop.city}, {tooltip.stop.country}</p>
            <p className="text-[10px] text-slate-600 mt-1">
              Stop {tooltip.index} of {stops.length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
