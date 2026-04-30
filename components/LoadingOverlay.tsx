"use client";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";

interface LoadingOverlayProps {
  onDone: () => void;
}

const STRIPE_PATH = "M234.5 0.914242C234.5 0.914242 224.826 0.290175 222.5 0.573742C215.701 1.40266 207.809 5.40118 201.5 8.07374C176.53 18.6506 151.246 29.4916 125.5 38.0737C112.913 42.2693 99.2813 45.9069 86 42.0737C74.0554 38.6263 70.2238 31.5095 62.5 22.5737C55.7435 14.757 47.4232 4.98951 36.5 4.07374H10.5H0.5V37.5737C0.5 37.5737 5.09129 37.9173 8 37.5737C14.6336 36.7903 20.6244 34.2369 27 32.5737C36.2709 30.1552 48.847 30.784 58 34.5737C68.3023 38.8394 73.4365 44.763 79 53.5737C84.5247 62.323 93.3797 66.9645 103 70.0737C108.881 71.7679 114.938 71.7971 121 71.0737C128.896 70.0037 136.6 67.9993 144 65.0737C156.457 60.1489 168.631 54.267 181 49.0737C198.631 41.6715 216.226 30.4561 234.5 24.9999V0.914242Z";

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function buildPath() {
  return new Path2D(STRIPE_PATH);
}

export default function LoadingOverlay({ onDone }: LoadingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t = setTimeout(onDone, 800);
    return () => clearTimeout(t);
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const DURATION = 1800;
    const STAGGER = 200;
    const OFFSETS = [0, H * 0.3, H * 0.6];
    let rafId: number;
    const start = performance.now();

    function draw(now: number) {
      ctx.clearRect(0, 0, W, H);

      for (let s = 0; s < 3; s++) {
        const elapsed = now - start - s * STAGGER;
        if (elapsed <= 0) continue;
        const raw = Math.min(elapsed / DURATION, 1);
        const progress = easeInOutQuad(raw);
        const clipW = W * progress;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, clipW, H);
        ctx.clip();

        ctx.save();
        ctx.scale(W / 235, H / 73);
        ctx.translate(0, (OFFSETS[s] / H) * 73);
        const path = buildPath();
        ctx.fillStyle = "#C8102E";
        ctx.fill(path);
        ctx.restore();

        ctx.restore();
      }

      if (now - start < DURATION + STAGGER * 2) {
        rafId = requestAnimationFrame(draw);
      }
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#ede8d0] dark:bg-[#1a1917] gap-6"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
      <h1 className="text-6xl tracking-widest uppercase text-black dark:text-[#b8b2a0]" style={{ position: "relative", zIndex: 1 }}>
        Wordle Cup
      </h1>
      <div className="w-8 h-8 border-2 border-black dark:border-[#b8b2a0] border-t-transparent rounded-full animate-spin" style={{ position: "relative", zIndex: 1 }} />
    </motion.div>
  );
}
