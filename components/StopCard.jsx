"use client"

export default function StopCard({ stop, index }) {
  const isFirst = index === 0
  return (
    <div className="flex items-center gap-2.5 px-4 py-2">
      <div className="w-4 h-4 rounded-full bg-[#c41230] flex items-center justify-center flex-shrink-0">
        <span
          className="text-white leading-none"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "8px", fontWeight: 700 }}
        >
          {index + 1}
        </span>
      </div>

      {isFirst ? (
        <span
          className="text-xs text-slate-500 italic"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Birthplace — hidden
        </span>
      ) : (
        <span style={{ fontFamily: "Inter, sans-serif" }} className="text-xs">
          <span className="font-semibold text-slate-100">{stop.city}</span>
          <span className="text-slate-400">, {stop.country}</span>
          <span className="text-slate-500 ml-1.5 italic">— {stop.label}</span>
        </span>
      )}
    </div>
  )
}
