//a lot of this info is completely fradulentdont use in prod
export const MOCK_PLAYERS = [
  {
    id: "pulisic-christian",
    name: "Christian Pulisic",
    nationality: "USA",
    position: "FW",
    birthYear: 1998,
    // Born in Hershey, PA. Grew up playing for PA Classics (youth club in Lancaster County, PA).
    // Joined Borussia Dortmund academy 2015, first-team debut 2016. Sold to Chelsea Jan 2019.
    // Moved to AC Milan June 2023. Currently at AC Milan.
    careerStops: [
      { order: 1, club: "PA Classics", country: "USA", countryCode: "840", lat: 40.0379, lng: -76.3055, years: "2008-2015", note: "Hometown youth club, Lancaster County PA" },
      { order: 2, club: "Borussia Dortmund", country: "Germany", countryCode: "276", lat: 51.4926, lng: 7.4512, years: "2015-2019" },
      { order: 3, club: "Chelsea", country: "England", countryCode: "826", lat: 51.4816, lng: -0.1910, years: "2019-2023" },
      { order: 4, club: "AC Milan", country: "Italy", countryCode: "380", lat: 45.4781, lng: 9.1240, years: "2023-present" },
    ]
  },
  {
    id: "reyna-giovanni",
    name: "Giovanni Reyna",
    nationality: "USA",
    position: "MF",
    birthYear: 2002,
    // Born in Durham, NC. Father Claudio Reyna played in Germany (Wolfsburg, Sunderland, etc.).
    // Family moved to NYC area; Gio joined NYCFC academy ~2015, then moved to Dortmund 2019.
    // Loaned to Nottingham Forest Jan-Jun 2024. Permanently joined Borussia Mönchengladbach Aug 2025.
    careerStops: [
      { order: 1, club: "New York City FC (Academy)", country: "USA", countryCode: "840", lat: 40.8242, lng: -73.9225, years: "2015-2019", note: "Hometown academy, Yankee Stadium / Bronx NY" },
      { order: 2, club: "Borussia Dortmund", country: "Germany", countryCode: "276", lat: 51.4926, lng: 7.4512, years: "2019-2025" },
      { order: 3, club: "Nottingham Forest", country: "England", countryCode: "826", lat: 52.9399, lng: -1.1328, years: "2024", note: "Loan" },
      { order: 4, club: "Borussia Mönchengladbach", country: "Germany", countryCode: "276", lat: 51.1742, lng: 6.3855, years: "2025-present" },
    ]
  },
  {
    id: "mckennie-weston",
    name: "Weston McKennie",
    nationality: "USA",
    position: "MF",
    birthYear: 1998,
    // Born at Fort Lewis, WA (military base). Grew up in Little Elm / Frisco TX area.
    // Joined FC Dallas academy ~2009, signed by Schalke 2016 (first-team 2017).
    // Loaned then permanently signed by Juventus 2020/2021.
    // Loaned to Leeds United Jan-Jun 2023. Back at Juventus; extended contract to 2030 in Mar 2026.
    careerStops: [
      { order: 1, club: "FC Dallas (Academy)", country: "USA", countryCode: "840", lat: 33.1548, lng: -96.8353, years: "2009-2016", note: "Hometown academy, Toyota Stadium Frisco TX" },
      { order: 2, club: "Schalke 04", country: "Germany", countryCode: "276", lat: 51.5543, lng: 7.0679, years: "2016-2020" },
      { order: 3, club: "Juventus", country: "Italy", countryCode: "380", lat: 45.1096, lng: 7.6412, years: "2020-present" },
      { order: 4, club: "Leeds United", country: "England", countryCode: "826", lat: 53.7775, lng: -1.5724, years: "2023", note: "Loan" },
    ]
  },
  {
    id: "dest-sergino",
    name: "Sergiño Dest",
    nationality: "USA",
    position: "RB",
    birthYear: 2000,
    // Born in Almere, Netherlands (Dutch-American). Joined Almere City FC youth ~2006.
    // Moved to Ajax academy 2012. Ajax first team 2019. Sold to Barcelona Oct 2020.
    // Loaned to AC Milan 2022-23. Joined PSV on loan 2023, permanently Jun 2024 (contract to 2028).
    careerStops: [
      { order: 1, club: "Ajax", country: "Netherlands", countryCode: "528", lat: 52.3143, lng: 4.9416, years: "2012-2020" },
      { order: 2, club: "Barcelona", country: "Spain", countryCode: "724", lat: 41.3809, lng: 2.1228, years: "2020-2023" },
      { order: 3, club: "AC Milan", country: "Italy", countryCode: "380", lat: 45.4781, lng: 9.1240, years: "2022-2023", note: "Loan" },
      { order: 4, club: "PSV Eindhoven", country: "Netherlands", countryCode: "528", lat: 51.4416, lng: 5.4672, years: "2023-present" },
    ]
  },
  {
    id: "adams-tyler",
    name: "Tyler Adams",
    nationality: "USA",
    position: "MF",
    birthYear: 1999,
    // Born in Wappingers Falls, NY. Identified by NY Red Bulls at a local summer camp.
    // Joined Red Bulls academy, signed first pro contract with Red Bulls II at 16.
    // Transferred to RB Leipzig Jan 2019. Leeds United Jul 2022. Bournemouth Aug 2023 (5-yr deal).
    careerStops: [
      { order: 1, club: "New York Red Bulls (Academy)", country: "USA", countryCode: "840", lat: 40.7369, lng: -74.1503, years: "2013-2019", note: "Hometown academy, Harrison NJ" },
      { order: 2, club: "RB Leipzig", country: "Germany", countryCode: "276", lat: 51.3459, lng: 12.3484, years: "2019-2022" },
      { order: 3, club: "Leeds United", country: "England", countryCode: "826", lat: 53.7775, lng: -1.5724, years: "2022-2023" },
      { order: 4, club: "Bournemouth", country: "England", countryCode: "826", lat: 50.7352, lng: -1.8381, years: "2023-present" },
    ]
  },
]

export const MOCK_PUZZLES = [
  { index: 1, playerId: "pulisic-christian" },
  { index: 2, playerId: "reyna-giovanni" },
  { index: 3, playerId: "mckennie-weston" },
  { index: 4, playerId: "dest-sergino" },
  { index: 5, playerId: "adams-tyler" },
]
