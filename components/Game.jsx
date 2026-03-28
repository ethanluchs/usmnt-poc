"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { PLAYERS, getTodaysPlayer } from "../lib/players"
import GuessInput from "./GuessInput"
import ResultCard from "./ResultCard"
import CardCollection from "./CardCollection"
import { db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"

const WorldMap = dynamic(() => import("./WorldMap"), { ssr: false })

const STARTING_SCORE  = 100
const COST_PER_WRONG  = 15
const COST_PER_REVEAL = 8
const SCORE_FLOOR     = 25
const MAX_WRONG       = 5

function calcScore(voluntaryReveals, wrongCount) {
  return Math.max(SCORE_FLOOR, STARTING_SCORE - wrongCount * COST_PER_WRONG - voluntaryReveals * COST_PER_REVEAL)
}

function getRarity(score) {
  if (score >= 91) return "legendary"
  if (score >= 76) return "epic"
  if (score >= 51) return "rare"
  if (score >= 26) return "uncommon"
  return "common"
}

function initState(player) {
  return {
    player,
    revealedCount:    1,
    voluntaryReveals: 0,
    wrongGuesses:     [],
    gameOver:         false,
    won:              false,
  }
}

export default function Game() {
  const [state, setState] = useState(() => initState(getTodaysPlayer()))
  const [showCollection, setShowCollection] = useState(false)
  const cardSaved = useRef(false)

  // Try to load today's puzzle from Firestore collection `dailyPuzzles/{YYYY-MM-DD}`
  useEffect(() => {
    let mounted = true
    const loadDaily = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
        console.log(today)
        const ref = doc(db, "dailyPuzzles", today)
        const snap = await getDoc(ref)
        if (!mounted) return
        if (snap.exists()) {
          const data = snap.data()
          // data may either be an array at root or contain a field like `stops`.
          let stops = null
          if (Array.isArray(data)) stops = data
          else if (Array.isArray(data.stops)) stops = data.stops
          else if (Array.isArray(data.points)) stops = data.points

          if (stops && stops.length > 0) {
            const playerFromDaily = {
              name: `Daily ${today}`,
              stops: stops.map((pt) => ({
                lat: pt.latitude ?? pt.lat ?? pt.latlng?.[0] ?? pt.lat,
                lng: pt.longitude ?? pt.lng ?? pt.latlng?.[1] ?? pt.lng,
                city: pt.city || pt.label || "",
                country: pt.country || "",
                label: pt.label || pt.city || "",
              })),
              position: "",
              caps: 0,
              line: "",
            }
            cardSaved.current = false
            setState(initState(playerFromDaily))
          }
        }
      } catch (e) {
        console.error("Failed to load daily puzzle from Firestore", e)
      }
    }
    loadDaily()
    return () => {
      mounted = false
    }
  }, [])

  const { player, revealedCount, voluntaryReveals, wrongGuesses, gameOver, won } = state
  const score        = calcScore(voluntaryReveals, wrongGuesses.length)
  const allRevealed  = revealedCount >= player.stops.length
  const attemptsLeft = MAX_WRONG - wrongGuesses.length

  // Save card to localStorage once on game over
  useEffect(() => {
    if (!gameOver || cardSaved.current) return
    cardSaved.current = true
    const card = {
      name:     player.name,
      position: player.position,
      caps:     player.caps,
      score,
      rarity:   getRarity(score),
      won,
      date:     new Date().toISOString(),
    }
    try {
      const existing = JSON.parse(localStorage.getItem("trailblazer-cards") || "[]")
      localStorage.setItem("trailblazer-cards", JSON.stringify([...existing, card]))
    } catch (_) {}
  }, [gameOver]) // eslint-disable-line

  function switchPlayer(name) {
    const p = PLAYERS.find((pl) => pl.name === name)
    if (p) { cardSaved.current = false; setState(initState(p)) }
  }

  function handleReveal() {
    if (allRevealed || gameOver) return
    setState((s) => ({ ...s, revealedCount: s.revealedCount + 1, voluntaryReveals: s.voluntaryReveals + 1 }))
  }

  function handleGuess(name) {
    if (gameOver) return
    if (name === player.name) {
      setState((s) => ({ ...s, gameOver: true, won: true }))
      return
    }
    if (wrongGuesses.includes(name)) return
    const newWrong   = [...wrongGuesses, name]
    const newRevealed = Math.min(revealedCount + 1, player.stops.length)
    setState((s) => ({ ...s, wrongGuesses: newWrong, revealedCount: newRevealed, gameOver: newWrong.length >= MAX_WRONG }))
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* ── Dev tool: player switcher — buried in corner, not part of game UI ── */}
      <div className="absolute top-2 left-2 z-30">
        <select
          value={player.name}
          onChange={(e) => switchPlayer(e.target.value)}
          className="text-[9px] bg-transparent border border-white/5 rounded px-1 py-0.5 text-slate-700 hover:text-slate-500 focus:outline-none cursor-pointer transition-colors appearance-none"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {PLAYERS.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>
      </div>

      {/* ── Full-screen map ──────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        <WorldMap stops={player.stops} revealedCount={revealedCount} />
      </div>

      {/* ── Top panel ───────────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0c1322]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl px-5 py-4 space-y-3">

            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-baseline gap-2.5">
                <h1 className="text-lg font-bold tracking-tight leading-none text-white">Trailblazer</h1>
                <span className="hidden sm:inline text-xs text-slate-400" style={{ fontFamily: "Inter, sans-serif" }}>
                  Guess the USMNT player
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Collection button */}
                <button
                  onClick={() => setShowCollection(true)}
                  className="text-slate-400 hover:text-white transition-colors text-sm leading-none"
                  title="Your collection"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  🃏
                </button>

                {/* Score */}
                <div className="text-right leading-none">
                  <p className="text-2xl font-bold text-[#f43f5e]">{score}</p>
                  <p className="text-[10px] text-slate-400" style={{ fontFamily: "Inter, sans-serif" }}>pts</p>
                </div>
              </div>
            </div>

            {/* Guess + reveal */}
            {!gameOver && (
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <GuessInput onGuess={handleGuess} disabled={false} />
                </div>
                <button
                  onClick={handleReveal}
                  disabled={allRevealed}
                  className="flex-shrink-0 px-4 py-2.5 border border-white/10 rounded-lg text-sm font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Reveal stop
                  <span className="text-slate-500 font-normal ml-1 text-xs">−{COST_PER_REVEAL} pts</span>
                </button>
              </div>
            )}

            {/* Attempt tracker */}
            {!gameOver && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {Array.from({ length: MAX_WRONG }, (_, i) => (
                    <div key={i}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${
                        i < wrongGuesses.length ? "bg-[#f43f5e]" : "bg-white/10 border border-white/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500" style={{ fontFamily: "Inter, sans-serif" }}>
                  {attemptsLeft} guess{attemptsLeft !== 1 ? "es" : ""} left · wrong guess reveals next stop (−{COST_PER_WRONG} pts)
                </span>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Bottom panel ────────────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="max-w-2xl mx-auto space-y-2">

          {gameOver && (
            <ResultCard
              player={player}
              score={score}
              stopsUsed={revealedCount}
              voluntaryReveals={voluntaryReveals}
              wrongGuesses={wrongGuesses.length}
              won={won}
              onViewCollection={() => setShowCollection(true)}
            />
          )}

          {wrongGuesses.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {wrongGuesses.map((g) => (
                <span key={g}
                  className="px-2.5 py-1 bg-slate-900/80 backdrop-blur border border-white/10 rounded-full text-xs line-through text-slate-500 shadow-sm"
                  style={{ fontFamily: "Inter, sans-serif" }}>
                  {g}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ── Card collection modal ────────────────────────────────────────── */}
      {showCollection && <CardCollection onClose={() => setShowCollection(false)} />}

    </div>
  )
}
