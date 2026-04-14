import { doc, getDoc } from "firebase/firestore"
import { db } from "../firebase"

export async function fetchTodaysPuzzle() {
  const today = new Date().toISOString().split("T")[0]
  const snap = await getDoc(doc(db, "puzzles", today))
  return snap.exists() ? snap.data() : null
}

export async function fetchPlayer(playerId) {
  const snap = await getDoc(doc(db, "players", playerId))
  return snap.exists() ? snap.data() : null
}
