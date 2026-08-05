// Known coordinates + UN M49 country codes for clubs that repeat often across
// player career histories. Anything not in here falls back to geocoding the
// club's location string via Nominatim (OpenStreetMap) at fetch time.
//
// countryCode values match lib/types.ts CareerStop.countryCode convention
// (UN M49 numeric codes as strings), consistent with existing mockData.ts.

const CLUB_COORDS = {
  "Real Madrid": { lat: 40.4531, lng: -3.6883, country: "Spain", countryCode: "724" },
  "FC Barcelona": { lat: 41.3809, lng: 2.1228, country: "Spain", countryCode: "724" },
  "Barcelona": { lat: 41.3809, lng: 2.1228, country: "Spain", countryCode: "724" },
  "Atletico Madrid": { lat: 40.4362, lng: -3.5995, country: "Spain", countryCode: "724" },
  "Atlético Madrid": { lat: 40.4362, lng: -3.5995, country: "Spain", countryCode: "724" },
  "Sevilla": { lat: 37.3840, lng: -5.9707, country: "Spain", countryCode: "724" },
  "Valencia": { lat: 39.4747, lng: -0.3583, country: "Spain", countryCode: "724" },
  "Real Sociedad": { lat: 43.3014, lng: -1.9744, country: "Spain", countryCode: "724" },
  "Athletic Bilbao": { lat: 43.2642, lng: -2.9496, country: "Spain", countryCode: "724" },
  "Villarreal": { lat: 39.9442, lng: -0.1037, country: "Spain", countryCode: "724" },

  "Manchester United": { lat: 53.4631, lng: -2.2913, country: "England", countryCode: "826" },
  "Manchester City": { lat: 53.4831, lng: -2.2004, country: "England", countryCode: "826" },
  "Liverpool": { lat: 53.4308, lng: -2.9608, country: "England", countryCode: "826" },
  "Chelsea": { lat: 51.4816, lng: -0.1910, country: "England", countryCode: "826" },
  "Arsenal": { lat: 51.5549, lng: -0.1084, country: "England", countryCode: "826" },
  "Tottenham Hotspur": { lat: 51.6043, lng: -0.0668, country: "England", countryCode: "826" },
  "Tottenham": { lat: 51.6043, lng: -0.0668, country: "England", countryCode: "826" },
  "Leicester City": { lat: 52.6204, lng: -1.1422, country: "England", countryCode: "826" },
  "Everton": { lat: 53.4388, lng: -2.9663, country: "England", countryCode: "826" },
  "Newcastle United": { lat: 54.9756, lng: -1.6217, country: "England", countryCode: "826" },
  "West Ham United": { lat: 51.5386, lng: -0.0166, country: "England", countryCode: "826" },
  "Aston Villa": { lat: 52.5092, lng: -1.8848, country: "England", countryCode: "826" },
  "Leeds United": { lat: 53.7775, lng: -1.5724, country: "England", countryCode: "826" },
  "Bournemouth": { lat: 50.7352, lng: -1.8381, country: "England", countryCode: "826" },
  "Nottingham Forest": { lat: 52.9399, lng: -1.1328, country: "England", countryCode: "826" },
  "Crystal Palace": { lat: 51.3983, lng: -0.0855, country: "England", countryCode: "826" },
  "Brighton": { lat: 50.8615, lng: -0.0837, country: "England", countryCode: "826" },
  "Wolverhampton Wanderers": { lat: 52.5901, lng: -2.1301, country: "England", countryCode: "826" },
  "Fulham": { lat: 51.4749, lng: -0.2216, country: "England", countryCode: "826" },

  "Bayern Munich": { lat: 48.2188, lng: 11.6247, country: "Germany", countryCode: "276" },
  "Bayern München": { lat: 48.2188, lng: 11.6247, country: "Germany", countryCode: "276" },
  "Borussia Dortmund": { lat: 51.4926, lng: 7.4512, country: "Germany", countryCode: "276" },
  "RB Leipzig": { lat: 51.3459, lng: 12.3484, country: "Germany", countryCode: "276" },
  "Bayer Leverkusen": { lat: 51.0379, lng: 7.0023, country: "Germany", countryCode: "276" },
  "Schalke 04": { lat: 51.5543, lng: 7.0679, country: "Germany", countryCode: "276" },
  "VfB Stuttgart": { lat: 48.7924, lng: 9.2321, country: "Germany", countryCode: "276" },
  "Borussia Mönchengladbach": { lat: 51.1742, lng: 6.3855, country: "Germany", countryCode: "276" },
  "Eintracht Frankfurt": { lat: 50.0685, lng: 8.6455, country: "Germany", countryCode: "276" },
  "Hertha BSC": { lat: 52.5147, lng: 13.2394, country: "Germany", countryCode: "276" },
  "Werder Bremen": { lat: 53.0663, lng: 8.8378, country: "Germany", countryCode: "276" },
  "Hamburger SV": { lat: 53.5872, lng: 9.8985, country: "Germany", countryCode: "276" },

  "Juventus": { lat: 45.1096, lng: 7.6412, country: "Italy", countryCode: "380" },
  "AC Milan": { lat: 45.4781, lng: 9.1240, country: "Italy", countryCode: "380" },
  "Inter Milan": { lat: 45.4781, lng: 9.1240, country: "Italy", countryCode: "380" },
  "Internazionale": { lat: 45.4781, lng: 9.1240, country: "Italy", countryCode: "380" },
  "AS Roma": { lat: 41.9339, lng: 12.4547, country: "Italy", countryCode: "380" },
  "Roma": { lat: 41.9339, lng: 12.4547, country: "Italy", countryCode: "380" },
  "Napoli": { lat: 40.8279, lng: 14.1930, country: "Italy", countryCode: "380" },
  "SSC Napoli": { lat: 40.8279, lng: 14.1930, country: "Italy", countryCode: "380" },
  "Lazio": { lat: 41.9339, lng: 12.4547, country: "Italy", countryCode: "380" },
  "Fiorentina": { lat: 43.7809, lng: 11.2822, country: "Italy", countryCode: "380" },
  "Atalanta": { lat: 45.7091, lng: 9.6807, country: "Italy", countryCode: "380" },

  "Paris Saint-Germain": { lat: 48.8414, lng: 2.2530, country: "France", countryCode: "250" },
  "Paris SG": { lat: 48.8414, lng: 2.2530, country: "France", countryCode: "250" },
  "PSG": { lat: 48.8414, lng: 2.2530, country: "France", countryCode: "250" },
  "Olympique Marseille": { lat: 43.2699, lng: 5.3959, country: "France", countryCode: "250" },
  "Olympique Lyonnais": { lat: 45.7654, lng: 4.9822, country: "France", countryCode: "250" },
  "Lyon": { lat: 45.7654, lng: 4.9822, country: "France", countryCode: "250" },
  "AS Monaco": { lat: 43.7276, lng: 7.4152, country: "Monaco", countryCode: "492" },
  "Monaco": { lat: 43.7276, lng: 7.4152, country: "Monaco", countryCode: "492" },
  "Lille": { lat: 50.6119, lng: 3.1303, country: "France", countryCode: "250" },
  "Rennes": { lat: 48.1073, lng: -1.7133, country: "France", countryCode: "250" },

  "Ajax": { lat: 52.3143, lng: 4.9416, country: "Netherlands", countryCode: "528" },
  "PSV Eindhoven": { lat: 51.4416, lng: 5.4672, country: "Netherlands", countryCode: "528" },
  "Feyenoord": { lat: 51.8935, lng: 4.5232, country: "Netherlands", countryCode: "528" },

  "FC Porto": { lat: 41.1617, lng: -8.5836, country: "Portugal", countryCode: "620" },
  "Porto": { lat: 41.1617, lng: -8.5836, country: "Portugal", countryCode: "620" },
  "Benfica": { lat: 38.7527, lng: -9.1846, country: "Portugal", countryCode: "620" },
  "SL Benfica": { lat: 38.7527, lng: -9.1846, country: "Portugal", countryCode: "620" },
  "Sporting CP": { lat: 38.7614, lng: -9.1607, country: "Portugal", countryCode: "620" },
  "Sporting Lisbon": { lat: 38.7614, lng: -9.1607, country: "Portugal", countryCode: "620" },

  "Boca Juniors": { lat: -34.6356, lng: -58.3648, country: "Argentina", countryCode: "032" },
  "River Plate": { lat: -34.5453, lng: -58.4497, country: "Argentina", countryCode: "032" },

  "Flamengo": { lat: -22.9121, lng: -43.2302, country: "Brazil", countryCode: "076" },
  "Santos": { lat: -23.9531, lng: -46.3428, country: "Brazil", countryCode: "076" },
  "Corinthians": { lat: -23.5453, lng: -46.4742, country: "Brazil", countryCode: "076" },
  "São Paulo": { lat: -23.5980, lng: -46.7580, country: "Brazil", countryCode: "076" },
  "Palmeiras": { lat: -23.5271, lng: -46.6017, country: "Brazil", countryCode: "076" },
  "Cruzeiro": { lat: -19.9057, lng: -43.9506, country: "Brazil", countryCode: "076" },
  "Fluminense": { lat: -22.9484, lng: -43.2270, country: "Brazil", countryCode: "076" },
  "Grêmio": { lat: -30.0678, lng: -51.2352, country: "Brazil", countryCode: "076" },
  "Vasco da Gama": { lat: -22.8917, lng: -43.2306, country: "Brazil", countryCode: "076" },

  "LA Galaxy": { lat: 33.8644, lng: -118.2611, country: "USA", countryCode: "840" },
  "Inter Miami": { lat: 26.1224, lng: -80.1373, country: "USA", countryCode: "840" },
  "New York Red Bulls": { lat: 40.7369, lng: -74.1503, country: "USA", countryCode: "840" },
  "New York City FC": { lat: 40.8242, lng: -73.9225, country: "USA", countryCode: "840" },
  "FC Dallas": { lat: 33.1548, lng: -96.8353, country: "USA", countryCode: "840" },
  "Seattle Sounders": { lat: 47.5952, lng: -122.3316, country: "USA", countryCode: "840" },

  "Al Nassr": { lat: 24.6877, lng: 46.7219, country: "Saudi Arabia", countryCode: "682" },
  "Al-Nassr": { lat: 24.6877, lng: 46.7219, country: "Saudi Arabia", countryCode: "682" },
  "Al Hilal": { lat: 24.6408, lng: 46.7728, country: "Saudi Arabia", countryCode: "682" },

  "Galatasaray": { lat: 41.1039, lng: 28.9910, country: "Turkey", countryCode: "792" },
  "Fenerbahçe": { lat: 40.9877, lng: 29.0367, country: "Turkey", countryCode: "792" },

  "Celtic": { lat: 55.8497, lng: -4.2058, country: "Scotland", countryCode: "826" },
  "Rangers": { lat: 55.8531, lng: -4.3092, country: "Scotland", countryCode: "826" },
};

function normalizeClubName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function lookupClubCoords(clubName) {
  const normalized = normalizeClubName(clubName);
  if (CLUB_COORDS[normalized]) return CLUB_COORDS[normalized];
  // try case-insensitive partial match
  const lower = normalized.toLowerCase();
  const key = Object.keys(CLUB_COORDS).find(
    (k) => k.toLowerCase() === lower || lower.includes(k.toLowerCase())
  );
  return key ? CLUB_COORDS[key] : null;
}

module.exports = { CLUB_COORDS, lookupClubCoords };
