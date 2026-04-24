export interface CareerStop {
  order: number;
  club: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  years: string;
  note?: string;
}

export interface Player {
  id: string;
  name: string;
  nationality: string;
  position: "FW" | "MF" | "DF" | "GK" | "RB" | (string & {});
  birthYear?: number;
  careerStops: CareerStop[];
}

export type Puzzle = Player;

export type GuessResult = "correct" | "wrong" | null;

export type PanTarget = { lng: number; lat: number } | null;

export type PinnedStop = { stop: CareerStop; x: number; y: number } | false | null;

export interface AuthContextValue {
  user: import("firebase/auth").User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}
