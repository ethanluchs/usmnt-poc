// CareerPath renders inside ZoomableGroup (SVG context)
// stops: array of careerStop objects { lat, lng, club, country, years, order }
// Renders lines between stops and a marker at each stop

export default function CareerPath({ stops = [], isDark }) {
  if (stops.length === 0) return null

  // TODO: convert lat/lng to SVG coordinates using react-simple-maps useProjection or Marker
  // We are given a stop object to work with
  // TODO: draw animated SVG lines between consecutive stops
  // TODO: render a StopMarker at each stop position

  return null
}
