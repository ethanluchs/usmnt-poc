"use client";

import { useEffect, useRef, useState } from "react";
import JerseyEmblem from "./JerseyEmblem";

const STRIPE_PATH = "M234.5 0.914242C234.5 0.914242 224.826 0.290175 222.5 0.573742C215.701 1.40266 207.809 5.40118 201.5 8.07374C176.53 18.6506 151.246 29.4916 125.5 38.0737C112.913 42.2693 99.2813 45.9069 86 42.0737C74.0554 38.6263 70.2238 31.5095 62.5 22.5737C55.7435 14.757 47.4232 4.98951 36.5 4.07374H10.5H0.5V37.5737C0.5 37.5737 5.09129 37.9173 8 37.5737C14.6336 36.7903 20.6244 34.2369 27 32.5737C36.2709 30.1552 48.847 30.784 58 34.5737C68.3023 38.8394 73.4365 44.763 79 53.5737C84.5247 62.323 93.3797 66.9645 103 70.0737C108.881 71.7679 114.938 71.7971 121 71.0737C128.896 70.0037 136.6 67.9993 144 65.0737C156.457 60.1489 168.631 54.267 181 49.0737C198.631 41.6715 216.226 30.4561 234.5 24.9999V0.914242Z";

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export type LoadingVariant = "usa" | "mexico" | "canada";

interface AsciiOverlayProps {
  onDone?: (variant: LoadingVariant) => void;
  isDark?: boolean;
}

function USAStripesOverlay({ isDark, fading }: { isDark: boolean; fading: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;
    const DURATION = 1800;
    let rafId: number;
    const start = performance.now();
    const STRIPE_H = H * 0.25;
    const BLEED = 80;
    const centerY = H / 2 - STRIPE_H / 2;
    const stripes = [
      { offsetY: centerY - STRIPE_H * 1.3, delay: 0 },
      { offsetY: centerY,                   delay: 150 },
      { offsetY: centerY + STRIPE_H * 1.3,  delay: 300 },
    ];

    function draw(now: number) {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#C8102E";
      for (const { offsetY, delay } of stripes) {
        const elapsed = now - start - delay;
        if (elapsed <= 0) continue;
        const progress = easeInOutQuad(Math.min(elapsed / DURATION, 1));
        ctx.save();
        ctx.beginPath();
        ctx.rect(-BLEED, 0, (W + BLEED * 2) * progress, H);
        ctx.clip();
        ctx.save();
        ctx.translate(-BLEED, offsetY);
        ctx.scale((W + BLEED * 2) / 235, STRIPE_H / 73);
        ctx.fill(new Path2D(STRIPE_PATH));
        ctx.restore();
        ctx.restore();
      }
      if (now - start < DURATION + 300) {
        rafId = requestAnimationFrame(draw);
      }
    }
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"} ${isDark ? "bg-black" : "bg-white"}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
    </div>
  );
}

const CANADA_RIGHT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="147" height="139" viewBox="0 0 147 139" fill="none"><path d="M110.602 71.0513L73.4897 0.232082V138.466H127.285L146.011 48.9203L110.602 71.0513Z" fill="#A9141B"/></svg>`;
const CANADA_LEFT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="147" height="139" viewBox="0 0 147 139" fill="none"><path d="M36.1503 71.0733L73.2741 0.232269V138.509H19.4617L0.7295 48.9355L36.1503 71.0733Z" fill="#95131F"/></svg>`;

function easeInQuart(t: number) {
  return t * t * t * t;
}

function CanadaOverlay({ isDark, fading }: { isDark: boolean; fading: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const SLIDE_DURATION = 500;
    const SHAKE_DURATION = 300;
    const SHAKE_STRENGTH = 10;
    const SVG_NATIVE_W = 147, SVG_NATIVE_H = 139;
    const scale = Math.min(W, H) * 1.1 / SVG_NATIVE_H;
    const dw = SVG_NATIVE_W * scale;
    const dh = SVG_NATIVE_H * scale;
    const destX = (W - dw) / 2;
    const destY = (H - dh) / 2;

    const leftImg = new Image();
    const rightImg = new Image();
    leftImg.src = `data:image/svg+xml,${encodeURIComponent(CANADA_LEFT_SVG)}`;
    rightImg.src = `data:image/svg+xml,${encodeURIComponent(CANADA_RIGHT_SVG)}`;

    let rafId: number;
    let start: number | null = null;
    let loaded = 0;

    function draw(now: number) {
      if (!start) start = now;
      const elapsed = now - start;
      const t = Math.min(elapsed / SLIDE_DURATION, 1);
      const offsetX = (1 - easeInQuart(t)) * W * 0.6;

      const shakeElapsed = elapsed - SLIDE_DURATION;
      let shakeX = 0, shakeY = 0;
      if (shakeElapsed > 0 && shakeElapsed < SHAKE_DURATION) {
        const decay = 1 - shakeElapsed / SHAKE_DURATION;
        shakeX = Math.sin(shakeElapsed * 0.18) * SHAKE_STRENGTH * decay;
        shakeY = Math.cos(shakeElapsed * 0.23) * SHAKE_STRENGTH * 0.5 * decay;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(leftImg,  destX - offsetX + 0.90 + shakeX, destY + shakeY, dw, dh);
      ctx.drawImage(rightImg, destX + offsetX - 0.90 + shakeX, destY + shakeY, dw, dh);

      if (elapsed < SLIDE_DURATION + SHAKE_DURATION) rafId = requestAnimationFrame(draw);
    }

    function onLoad() {
      loaded++;
      if (loaded === 2) rafId = requestAnimationFrame(draw);
    }

    leftImg.onload = onLoad;
    rightImg.onload = onLoad;
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"} ${isDark ? "bg-black" : "bg-white"}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />
    </div>
  );
}

function MexicoEmblemOverlay({ isDark, fading }: { isDark: boolean; fading: boolean }) {
  const [emblemSize, setEmblemSize] = useState(500);

  useEffect(() => {
    setEmblemSize(Math.max(window.innerWidth, window.innerHeight) * 0.4);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"} ${isDark ? "bg-black" : "bg-white"}`}
    >
      <JerseyEmblem size={emblemSize} />
    </div>
  );
}

export default function AsciiOverlay({
  onDone,
  isDark = false,
}: AsciiOverlayProps) {
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);
  const [variant, setVariant] = useState<LoadingVariant>("usa");
  const variantRef = useRef<LoadingVariant>("usa");

  useEffect(() => {
    const r = Math.random();
    const v: LoadingVariant = r < 0.333 ? "usa" : r < 0.666 ? "mexico" : "canada";
    variantRef.current = v;
    setVariant(v);
  }, []);

  useEffect(() => {
    const t = setTimeout(dismiss, 2200);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    if (doneRef.current) return;
    doneRef.current = true;
    setFading(true);
    setTimeout(() => onDone?.(variantRef.current), 500);
  }

  if (variant === "usa") return <USAStripesOverlay isDark={isDark} fading={fading} />;
  if (variant === "canada") return <CanadaOverlay isDark={isDark} fading={fading} />;
  return <MexicoEmblemOverlay isDark={isDark} fading={fading} />;
}
