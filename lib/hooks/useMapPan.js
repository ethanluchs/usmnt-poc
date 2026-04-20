'use client'
import { useState, useRef, useEffect } from "react"
import { useMotionValue, useSpring, useMotionValueEvent } from "motion/react"

export function useMapPan({ revealedStops, puzzleIndex, panTarget }) {
  const [center, setCenter] = useState([0, 10])
  const [zoom, setZoom] = useState(2)
  const zoomRef = useRef(2)
  const isUserInteracting = useRef(false)

  const targetLng = useMotionValue(0)
  const targetLat = useMotionValue(10)
  const targetZoom = useMotionValue(2)
  const springLng = useSpring(targetLng, { stiffness: 120, damping: 28 })
  const springLat = useSpring(targetLat, { stiffness: 120, damping: 28 })
  const springZoom = useSpring(targetZoom, { stiffness: 120, damping: 28 })

  const actualCenter = useRef([0, 10])
  const hasDragged = useRef(false)
  // Tracks last seen puzzleIndex to detect when revealedStops are still stale
  // from the previous puzzle after a puzzleIndex change
  const lastPuzzleIndex = useRef(puzzleIndex)

  // Springs only drive center/zoom when user is NOT interacting
  useMotionValueEvent(springLng, "change", () => {
    if (isUserInteracting.current) return
    const lng = springLng.get()
    const lat = springLat.get()
    setCenter([lng, lat])
    actualCenter.current = [lng, lat]
  })

  useMotionValueEvent(springZoom, "change", v => {
    if (isUserInteracting.current) return
    setZoom(v)
  })

  useEffect(() => {
    if (revealedStops.length === 0) return
    if (puzzleIndex !== lastPuzzleIndex.current) {
      lastPuzzleIndex.current = puzzleIndex
      return
    }
    const last = revealedStops[revealedStops.length - 1]
    if (revealedStops.length === 1) {
      // Snap instantly to first stop — no spring animation from world center
      targetLng.jump(last.lng)
      targetLat.jump(last.lat)
      springLng.jump(last.lng)
      springLat.jump(last.lat)
      targetZoom.jump(2)
      springZoom.jump(2)
      zoomRef.current = 2
      setCenter([last.lng, last.lat])
      actualCenter.current = [last.lng, last.lat]
      hasDragged.current = false
      return
    }
    if (hasDragged.current) {
      const [curLng, curLat] = actualCenter.current
      targetLng.jump(curLng)
      targetLat.jump(curLat)
      springLng.jump(curLng)
      springLat.jump(curLat)
      hasDragged.current = false
    }
    isUserInteracting.current = false
    targetZoom.set(2)
    zoomRef.current = 2
    targetLng.set(last.lng)
    targetLat.set(last.lat)
  }, [revealedStops.length, puzzleIndex])

  useEffect(() => {
    if (!panTarget) return
    isUserInteracting.current = false
    targetZoom.set(2)
    zoomRef.current = 2
    targetLng.set(panTarget.lng)
    targetLat.set(panTarget.lat)
    hasDragged.current = false
  }, [panTarget])

  const handleMoveStart = () => {
    isUserInteracting.current = true
    // Sync spring targets to current positions so they don't fight us
    // when we hand control back after drag ends
    targetLng.jump(springLng.get())
    targetLat.jump(springLat.get())
  }

  const handleMoveEnd = ({ coordinates, zoom: z }) => {
    actualCenter.current = coordinates
    zoomRef.current = z
    hasDragged.current = true
    // Sync everything and release back to spring-driven mode
    targetZoom.jump(z)
    springZoom.jump(z)
    targetLng.jump(coordinates[0])
    targetLat.jump(coordinates[1])
    springLng.jump(coordinates[0])
    springLat.jump(coordinates[1])
    isUserInteracting.current = false
    setCenter(coordinates)
    setZoom(z)
  }

  const panTo = (lng, lat) => {
    isUserInteracting.current = false
    targetLng.set(lng)
    targetLat.set(lat)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    isUserInteracting.current = true
    const [curLng, curLat] = actualCenter.current
    // Keep springs in sync so programmatic moves resume cleanly
    targetLng.jump(curLng)
    targetLat.jump(curLat)
    springLng.jump(curLng)
    springLat.jump(curLat)

    // factor < 1 zooms out, > 1 zooms in    scales proportionally at any zoom level
    const factor = Math.pow(0.999, e.deltaY)
    const next = Math.min(7, Math.max(1, zoomRef.current * factor))
    zoomRef.current = next
    targetZoom.jump(next)
    springZoom.jump(next)
    setZoom(next)
  }

  return { center, zoom, handleMoveStart, handleMoveEnd, handleWheel, panTo }
}
