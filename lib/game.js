import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "../firebase"

export async function fetchLocationPuzzles() {
  const snap = await getDocs(collection(db, "locationPuzzles"))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function fetchUserUnlockedCardIds(userId) {
  if (!userId) return new Set()

  const cardsSnap = await getDocs(collection(db, "users", userId, "cards"))
  const ids = cardsSnap.docs.map((d) => d.data()?.cardId || d.id).filter(Boolean)
  return new Set(ids)
}

export async function saveUserUnlockedCard(userId, player) {
  if (!userId || !player?.id) return

  await setDoc(
    doc(db, "users", userId, "cards", player.id),
    {
      cardId: player.id,
      name: player.name || null,
      nationality: player.nationality || null,
      position: player.position || null,
      unlockedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
