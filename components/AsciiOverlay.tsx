"use client";

import { useEffect, useRef, useState } from "react";
import JerseyEmblem from "./JerseyEmblem";

// USA stripes animation preserved in USAStripesOverlay (unused)
// STRIPE_PATH, easeInOutQuad, and canvas logic kept in git history

interface AsciiOverlayProps {
  onDone?: () => void;
  isDark?: boolean;
}

export default function AsciiOverlay({
  onDone,
  isDark = false,
}: AsciiOverlayProps) {
  const [fading, setFading] = useState(false);
  const [emblemSize, setEmblemSize] = useState(500);
  const doneRef = useRef(false);

  useEffect(() => {
    setEmblemSize(Math.max(window.innerWidth, window.innerHeight) * 0.4);
  }, []);

  useEffect(() => {
    const t = setTimeout(dismiss, 2200);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    if (doneRef.current) return;
    doneRef.current = true;
    setFading(true);
    setTimeout(() => onDone?.(), 500);
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"} ${isDark ? "bg-black" : "bg-white"}`}
    >
      <JerseyEmblem size={emblemSize} />
    </div>
  );
}
