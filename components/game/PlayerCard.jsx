export default function PlayerCard({ player }) {
  if (!player) return null

  return (
    <div className="w-32 rounded-xl bg-yellow-400 p-3 flex flex-col items-center gap-1 shadow-lg text-black">
      <span className="text-3xl font-black">{player.position}</span>
      <span className="text-xs font-bold tracking-wide text-center">{player.name}</span>
      <span className="text-xs opacity-60">{player.nationality}</span>
    </div>
  )
}
