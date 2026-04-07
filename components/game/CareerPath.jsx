'use client'
import { Line, Marker } from "react-simple-maps"
import StopCard from "./StopCard"

//{ order: 1, club: "PA Classics", country: "USA", countryCode: "840", lat: 40.0379, lng: -76.3055, years: "2008-2015", note: "Hometown youth club, Lancaster County PA" }
//This is given in array stops


export default function CareerPath({ stops = [], isDark }) {
  if (stops.length === 0) return null
  return (
    <g>
      {stops.map((stop, i) => {
        const next = stops[i + 1]
        return (
          <g key={stop.order}>
            {next && (<Line from={[stop.lng, stop.lat]} to={[next.lng, next.lat]} stroke={"#ede8d0"}/>)}

            <Marker coordinates={[stop.lng, stop.lat]}>
              <StopCard
                stop={stop}
                country={stop.country}
                years={stop.years}
                club={stop.club}
                order={stop.order}
                isDark={isDark}
              />
            </Marker>
          </g>
        )
      })}
    </g>
  )
}
