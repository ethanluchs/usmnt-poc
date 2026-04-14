'use client'
import { useState, useRef, useEffect } from "react"
import { useMotionValue, useSpring, useMotionValueEvent } from "motion/react"

export function useMapPan({ revealedStops, puzzleIndex, panTarget }) {
  const [center, setCenter] = useState([0, 10])
  const [zoom, setZoom] = useState(2)
  const zoomRef = useRef(2)

  const targetLng = useMotionValue(0)
  const targetLat = useMotionValue(10)
  const springLng = useSpring(targetLng, { stiffness: 120, damping: 28 })
  const springLat = useSpring(targetLat, { stiffness: 120, damping: 28 })

  const actualCenter = useRef([0, 10])
  const hasDragged = useRef(false)
  // Tracks last seen puzzleIndex to detect when revealedStops are still stale
  // from the previous puzzle after a puzzleIndex change
  const lastPuzzleIndex = useRef(puzzleIndex)

  useMotionValueEvent(springLng, "change", () => {
    const lng = springLng.get()
    const lat = springLat.get()
    setCenter([lng, lat])
    actualCenter.current = [lng, lat]
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
      setZoom(zoomRef.current)
      hasDragged.current = false
    }
    targetLng.set(last.lng)
    targetLat.set(last.lat)
  }, [revealedStops.length, puzzleIndex])

  useEffect(() => {
    if (!panTarget) return
    setTimeout(() => setZoom(2), 300)
    targetLng.set(panTarget.lng)
    targetLat.set(panTarget.lat)
  }, [panTarget])

  const handleMoveStart = () => {
    targetLng.jump(springLng.get())
    targetLat.jump(springLat.get())
  }

  const handleMoveEnd = ({ coordinates, zoom: z }) => {
    actualCenter.current = coordinates
    zoomRef.current = z
    hasDragged.current = true
  }

  const panTo = (lng, lat) => {
    targetLng.set(lng)
    targetLat.set(lat)
  }

  return { center, zoom, handleMoveStart, handleMoveEnd, panTo }
}
