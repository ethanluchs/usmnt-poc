import { Player } from "../../lib/types";

interface PlayerCardProps {
  player: Player | null;
  unlocked?: boolean;
}

export default function PlayerCard({ player, unlocked = true }: PlayerCardProps) {
  if (!player) return null;

  if (!unlocked) {
    return (
      <div
        style={{ aspectRatio: "2.5 / 3.5" }}
        className="w-full bg-black/10 flex items-center justify-center"
      >
        <span className="text-3xl opacity-20">?</span>
      </div>
    );
  }

  return (
    <div
      style={{ aspectRatio: "2.5 / 3.5" }}
      className="w-full bg-yellow-400 p-3 flex flex-col items-center justify-center gap-2 shadow-lg text-black"
    >
      <span className="text-2xl font-black">{player.position}</span>
      <span className="text-[10px] font-bold tracking-wide text-center leading-tight">
        {player.name}
      </span>
      <span className="text-[10px] opacity-60">{player.nationality}</span>
    </div>
  );
}
