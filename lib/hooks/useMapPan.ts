"use client";
import { useState, useRef, useEffect } from "react";
import { useMotionValue, useSpring, useMotionValueEvent } from "motion/react";
import { MoveEndPosition } from "react-simple-maps";
import { CareerStop, PanTarget } from "../types";

const MAX_ZOOM = 4;

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
  handleWheel: (e: React.WheelEvent) => void;
}

export function useMapPan({
  revealedStops,
  puzzleIndex,
  panTarget,
}: UseMapPanParams): MapPanReturn {
  // Refs hold the true live values; state is only used to trigger re-renders
  const centerRef = useRef<[number, number]>([0, 10]);
  const zoomStateRef = useRef(2);
  const [, forceUpdate] = useState(0);
  const isUserInteracting = useRef(false);

  const targetLng = useMotionValue(0);
  const targetLat = useMotionValue(10);
  const targetZoom = useMotionValue(2);
  const springLng = useSpring(targetLng, { stiffness: 120, damping: 28 });
  const springLat = useSpring(targetLat, { stiffness: 120, damping: 28 });
  const springZoom = useSpring(targetZoom, { stiffness: 120, damping: 28 });

  const lastPuzzleIndex = useRef(puzzleIndex);

  //Animation loop. schedules rerenders before each paint (60/sec)
  // updates refs to wherever spring happens to be at during its animations
  const scheduleRaf = () => {
    requestAnimationFrame(() => {
      if (isUserInteracting.current) return;
      centerRef.current = [springLng.get(), springLat.get()];
      zoomStateRef.current = springZoom.get();
      forceUpdate((n) => n + 1);
    });
  };

  useMotionValueEvent(springLng, "change", () => {
    if (isUserInteracting.current) return;
    scheduleRaf();
  });

  useMotionValueEvent(springZoom, "change", () => {
    if (isUserInteracting.current) return;
    scheduleRaf();
  });

  useEffect(() => {
    if (revealedStops.length === 0) return;
    if (puzzleIndex !== lastPuzzleIndex.current) {
      lastPuzzleIndex.current = puzzleIndex;
      return;
    }
    const last = revealedStops[revealedStops.length - 1];
    if (revealedStops.length === 1) {
      targetLng.jump(last.lng);
      targetLat.jump(last.lat);
      springLng.jump(last.lng);
      springLat.jump(last.lat);
      targetZoom.jump(2);
      springZoom.jump(2);
      centerRef.current = [last.lng, last.lat];
      zoomStateRef.current = 2;
      forceUpdate((n) => n + 1);
      return;
    }
    isUserInteracting.current = false;
    targetZoom.set(2);
    targetLng.set(last.lng);
    targetLat.set(last.lat);
    // run on changes to length causet he array is rebuilt w slice on every render see useGameState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedStops.length, puzzleIndex]);

  useEffect(() => {
    if (!panTarget) return;

    isUserInteracting.current = false;
    targetZoom.set(2);
    targetLng.set(panTarget.lng);
    targetLat.set(panTarget.lat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panTarget]);

  const handleMoveStart = () => {
    isUserInteracting.current = true;
  };

  const handleMoveEnd = ({ coordinates, zoom: z }: MoveEndPosition) => {
    centerRef.current = coordinates;
    zoomStateRef.current = z;
    targetZoom.jump(z);
    springZoom.jump(z);
    targetLng.jump(coordinates[0]);
    targetLat.jump(coordinates[1]);
    springLng.jump(coordinates[0]);
    springLat.jump(coordinates[1]);
    isUserInteracting.current = false;
    forceUpdate((n) => n + 1);
  };

  const handleWheel = (e: React.WheelEvent) => {
    isUserInteracting.current = true;
    const [curLng, curLat] = centerRef.current;
    targetLng.jump(curLng);
    targetLat.jump(curLat);
    springLng.jump(curLng);
    springLat.jump(curLat);

    const factor = Math.pow(0.999, e.deltaY);
    const next = Math.min(MAX_ZOOM, Math.max(1, zoomStateRef.current * factor));
    zoomStateRef.current = next;
    targetZoom.jump(next);
    springZoom.jump(next);
    forceUpdate((n) => n + 1);
  };

  return {
    center: centerRef.current,
    zoom: zoomStateRef.current,
    handleMoveStart,
    handleMoveEnd,
    handleWheel
  };
}
