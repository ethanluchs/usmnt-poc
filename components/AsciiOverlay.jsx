'use client'

import { useEffect, useRef, useState } from 'react'

const FPS = 24
const HOLD_AFTER_MS = 600

export default function AsciiOverlay({ onDone, isDark = false }) {
  const [frames, setFrames] = useState(null)
  const [frameIndex, setFrameIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const intervalRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    fetch('/weah-goal-bw.json')
      .then(r => r.json())
      .then(data => setFrames(data))
      .catch(() => dismiss())
  }, [])

  useEffect(() => {
    if (!frames) return
    intervalRef.current = setInterval(() => {
      setFrameIndex(i => {
        if (i >= frames.length - 1) {
          clearInterval(intervalRef.current)
          setTimeout(dismiss, HOLD_AFTER_MS)
          return i
        }
        return i + 1
      })
    }, 1000 / FPS)
    return () => clearInterval(intervalRef.current)
  }, [frames])

  function dismiss() {
    if (doneRef.current) return
    doneRef.current = true
    setFading(true)
    setTimeout(() => onDone?.(), 200)
  }

  const currentFrame = frames?.[frameIndex]

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'} ${isDark ? 'bg-black' : 'bg-[#ede8d0]'}`}
    >
      <pre
        className={`leading-[1] overflow-hidden select-none ${isDark ? 'text-[#ede8d0]' : 'text-black'}`}
        style={{ fontSize: 'min(0.45vw, 2.2vh)', fontFamily: 'monospace', letterSpacing: 0 }}
      >
        {currentFrame ? currentFrame.join('\n') : ''}
      </pre>

      <div className={`mt-6 w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${isDark ? 'border-[#ede8d0]' : 'border-black'}`} />
    </div>
  )
}
