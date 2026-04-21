import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { Player, Puzzle } from "./types";

export async function fetchLocationPuzzles(): Promise<Puzzle[]> {
  const snap = await getDocs(collection(db, "locationPuzzles"));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Player, "id">),
  }));
}

export async function fetchUserUnlockedCardIds(
  userId: string | null | undefined
): Promise<Set<string>> {
  if (!userId) return new Set();

  const cardsSnap = await getDocs(
    collection(db, "users", userId, "cards")
  );
  const ids = cardsSnap.docs
    .map((d) => (d.data()?.cardId as string | undefined) || d.id)
    .filter(Boolean);
  return new Set(ids);
}

export async function saveUserUnlockedCard(
  userId: string | null | undefined,
  player: Player
): Promise<void> {
  if (!userId || !player?.id) return;

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
  );
}
