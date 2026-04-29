"use client";

import { useEffect, useRef, useState } from "react";

const FPS = 24;
const HOLD_AFTER_MS = 600;

interface AsciiOverlayProps {
  onDone?: () => void;
  isDark?: boolean;
}

export default function AsciiOverlay({
  onDone,
  isDark = false,
}: AsciiOverlayProps) {
  const [frames, setFrames] = useState<string[][] | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const delay = 2000 + Math.random() * 2000;
    fetch("/weah-goal-bw.json")
      .then((r) => r.json())
      .then((data: string[][]) => setFrames(data))
      .catch(() => dismiss());
    const t = setTimeout(dismiss, delay);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!frames) return;
    intervalRef.current = setInterval(() => {
      setFrameIndex((i) => {
        if (i >= frames.length - 1) {
          clearInterval(intervalRef.current!);
          setTimeout(dismiss, HOLD_AFTER_MS);
          return i;
        }
        return i + 1;
      });
    }, 1000 / FPS);
    return () => clearInterval(intervalRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames]);

  function dismiss() {
    if (doneRef.current) return;
    doneRef.current = true;
    setFading(true);
    setTimeout(() => onDone?.(), 200);
  }

  const currentFrame = frames?.[frameIndex];

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"} ${isDark ? "bg-black" : "bg-white"}`}
    >
      <pre
        className={`leading-[1] overflow-hidden select-none ${isDark ? "text-[#ede8d0]" : "text-black"}`}
        style={{ fontSize: "min(0.45vw, 2.2vh)", fontFamily: "monospace", letterSpacing: 0 }}
      >
        {currentFrame ? currentFrame.join("\n") : ""}
      </pre>
      <div
        className={`mt-6 w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${isDark ? "border-[#ede8d0]" : "border-black"}`}
      />
    </div>
  );
}
