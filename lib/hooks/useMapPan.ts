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
  handleWheel: (e: WheelEvent) => void;
  panTo: (lng: number, lat: number) => void;
  panToOverview: (stops: CareerStop[]) => void;
}

export function useMapPan({
  revealedStops,
  puzzleIndex,
  panTarget,
}: UseMapPanParams): MapPanReturn {
  const [center, setCenter] = useState<[number, number]>([0, 10]);
  const [zoom, setZoom] = useState(2);
  const zoomRef = useRef(2);
  const isUserInteracting = useRef(false);

  const targetLng = useMotionValue(0);
  const targetLat = useMotionValue(10);
  const targetZoom = useMotionValue(2);
  const springLng = useSpring(targetLng, { stiffness: 120, damping: 28 });
  const springLat = useSpring(targetLat, { stiffness: 120, damping: 28 });
  const springZoom = useSpring(targetZoom, { stiffness: 120, damping: 28 });

  const actualCenter = useRef<[number, number]>([0, 10]);
  const hasDragged = useRef(false);
  const lastPuzzleIndex = useRef(puzzleIndex);

  useMotionValueEvent(springLng, "change", () => {
    if (isUserInteracting.current) return;
    const lng = springLng.get();
    const lat = springLat.get();
    setCenter([lng, lat]);
    actualCenter.current = [lng, lat];
  });

  useMotionValueEvent(springZoom, "change", (v) => {
    if (isUserInteracting.current) return;
    setZoom(v);
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
      zoomRef.current = 2;
      setCenter([last.lng, last.lat]);
      actualCenter.current = [last.lng, last.lat];
      hasDragged.current = false;
      return;
    }
    if (hasDragged.current) {
      const [curLng, curLat] = actualCenter.current;
      targetLng.jump(curLng);
      targetLat.jump(curLat);
      springLng.jump(curLng);
      springLat.jump(curLat);
      hasDragged.current = false;
    }
    isUserInteracting.current = false;
    targetZoom.set(2);
    zoomRef.current = 2;
    targetLng.set(last.lng);
    targetLat.set(last.lat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedStops.length, puzzleIndex]);

  useEffect(() => {
    if (!panTarget) return;
    if ("overview" in panTarget) {
      panToOverview(revealedStops);
      return;
    }
    isUserInteracting.current = false;
    targetZoom.set(2);
    zoomRef.current = 2;
    targetLng.set(panTarget.lng);
    targetLat.set(panTarget.lat);
    hasDragged.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panTarget]);

  const handleMoveStart = () => {
    isUserInteracting.current = true;
    targetLng.jump(springLng.get());
    targetLat.jump(springLat.get());
  };

  const handleMoveEnd = ({ coordinates, zoom: z }: MoveEndPosition) => {
    actualCenter.current = coordinates;
    zoomRef.current = z;
    hasDragged.current = true;
    targetZoom.jump(z);
    springZoom.jump(z);
    targetLng.jump(coordinates[0]);
    targetLat.jump(coordinates[1]);
    springLng.jump(coordinates[0]);
    springLat.jump(coordinates[1]);
    isUserInteracting.current = false;
    setCenter(coordinates);
    setZoom(z);
  };

  const panTo = (lng: number, lat: number) => {
    isUserInteracting.current = false;
    targetLng.set(lng);
    targetLat.set(lat);
  };

  const panToOverview = (stops: CareerStop[]) => {
    if (stops.length === 0) return;
    if (stops.length === 1) {
      panTo(stops[0].lng, stops[0].lat);
      return;
    }
    const lngs = stops.map((s) => s.lng);
    const lats = stops.map((s) => s.lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;
    // fit the bounding box into ~800x450 viewport (geoMercator at zoom=1)
    const lngSpan = Math.max(maxLng - minLng, 10);
    const latSpan = Math.max(maxLat - minLat, 10);
    const zoomLng = 360 / (lngSpan * 2.4);
    const zoomLat = 180 / (latSpan * 2.4);
    const fitZoom = Math.min(zoomLng, zoomLat, 5);
    isUserInteracting.current = false;
    hasDragged.current = false;
    targetLng.set(centerLng);
    targetLat.set(centerLat);
    targetZoom.set(Math.min(MAX_ZOOM, Math.max(1, fitZoom)));
    zoomRef.current = Math.min(MAX_ZOOM, Math.max(1, fitZoom));
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    isUserInteracting.current = true;
    const [curLng, curLat] = actualCenter.current;
    targetLng.jump(curLng);
    targetLat.jump(curLat);
    springLng.jump(curLng);
    springLat.jump(curLat);

    const factor = Math.pow(0.999, e.deltaY);
    const next = Math.min(MAX_ZOOM, Math.max(1, zoomRef.current * factor));
    zoomRef.current = next;
    targetZoom.jump(next);
    springZoom.jump(next);
    setZoom(next);
  };

  return { center, zoom, handleMoveStart, handleMoveEnd, handleWheel, panTo, panToOverview };
}
