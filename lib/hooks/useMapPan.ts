"use client";
import { useState, useRef, useEffect } from "react";
import { MoveEndPosition } from "react-simple-maps";
import { CareerStop, PanTarget } from "../types";

const STEPS = 6;
const STEP_MS = 80;

interface UseMapPanParams {
  revealedStops: CareerStop[];
  puzzleIndex: number;
  panTarget: PanTarget;
}

interface MapPanReturn {
  center: [number, number];
  zoom: number;
  handleMoveStart: () => void;
  handleMoveEnd: (pos: MoveEndPosition) => void;
  handleWheel: (e: WheelEvent) => void;
  panTo: (lng: number, lat: number) => void;
}

export function useMapPan({
  revealedStops,
  puzzleIndex,
  panTarget,
}: UseMapPanParams): MapPanReturn {
  const [center, setCenter] = useState<[number, number]>([0, 10]);
  const [zoom, setZoom] = useState(2);
  const zoomRef = useRef(2);
  const actualCenter = useRef<[number, number]>([0, 10]);
  const isUserInteracting = useRef(false);
  const hasDragged = useRef(false);
  const lastPuzzleIndex = useRef(puzzleIndex);
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearSteps() {
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];
  }

  function stepTo(toLng: number, toLat: number) {
    clearSteps();
    const [fromLng, fromLat] = actualCenter.current;
    for (let s = 1; s <= STEPS; s++) {
      const t = s / STEPS;
      const lng = fromLng + (toLng - fromLng) * t;
      const lat = fromLat + (toLat - fromLat) * t;
      const timer = setTimeout(() => {
        if (isUserInteracting.current) return;
        actualCenter.current = [lng, lat];
        setCenter([lng, lat]);
      }, s * STEP_MS);
      stepTimers.current.push(timer);
    }
  }

  useEffect(() => {
    if (revealedStops.length === 0) return;
    if (puzzleIndex !== lastPuzzleIndex.current) {
      lastPuzzleIndex.current = puzzleIndex;
      return;
    }
    const last = revealedStops[revealedStops.length - 1];
    if (revealedStops.length === 1) {
      clearSteps();
      actualCenter.current = [last.lng, last.lat];
      setCenter([last.lng, last.lat]);
      setZoom(2);
      zoomRef.current = 2;
      hasDragged.current = false;
      return;
    }
    hasDragged.current = false;
    isUserInteracting.current = false;
    setZoom(2);
    zoomRef.current = 2;
    stepTo(last.lng, last.lat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedStops.length, puzzleIndex]);

  useEffect(() => {
    if (!panTarget) return;
    isUserInteracting.current = false;
    hasDragged.current = false;
    setZoom(2);
    zoomRef.current = 2;
    stepTo(panTarget.lng, panTarget.lat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panTarget]);

  const handleMoveStart = () => {
    isUserInteracting.current = true;
    clearSteps();
  };

  const handleMoveEnd = ({ coordinates, zoom: z }: MoveEndPosition) => {
    actualCenter.current = coordinates;
    zoomRef.current = z;
    hasDragged.current = true;
    isUserInteracting.current = false;
    setCenter(coordinates);
    setZoom(z);
  };

  const panTo = (lng: number, lat: number) => {
    isUserInteracting.current = false;
    stepTo(lng, lat);
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    isUserInteracting.current = true;
    clearSteps();
    const factor = Math.pow(0.999, e.deltaY);
    const next = Math.min(7, Math.max(1, zoomRef.current * factor));
    zoomRef.current = next;
    setZoom(next);
  };

  return { center, zoom, handleMoveStart, handleMoveEnd, handleWheel, panTo };
}
