'use client'
// StopCard shows on hover/click of a stop marker
// Positioned absolutely over the map at the stop's screen coordinates

export default function StopCard({ stop, country, years, club, order, isDark }) {
  if (!stop) return null

  // TODO: position card at x/y with smart edge detection (flip if near screen edge)
  // TODO: animate in with framer-motion
  // TODO: show club, country, years

  return (
    <>
      <div className="border border-rounded flex flex-col">
          <p>Stop{order}/5</p>
          <p>Club:{club}</p>
          <p>{years}</p>
      </div>
    </>
  )
}
