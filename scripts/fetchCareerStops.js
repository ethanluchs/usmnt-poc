// Fetches career history (former clubs) for each player in
// data/players_seed_list.json from TheSportsDB's free API, resolves club
// coordinates (known-club table first, Nominatim geocoding fallback), and
// writes the result to data/players_with_stops.json.
//
// This does NOT write to Firestore directly — review the output first, then
// use a separate promote step to merge into playerRoster / locationPuzzles.
//
// Usage: node scripts/fetchCareerStops.js [--start=0] [--limit=20]
//
// Free tier rate limit is modest, so requests are paced and results are
// checkpointed to disk after every player in case of interruption.

const fs = require("fs");
const path = require("path");
const { lookupClubCoords } = require("./clubCoordinates");

const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const REQUEST_DELAY_MS = 2200; // stay well under free-tier 30 req/min
const NOMINATIM_DELAY_MS = 1100; // Nominatim usage policy: max 1 req/sec

const SEED_PATH = path.join(__dirname, "..", "data", "players_seed_list.json");
const OUTPUT_PATH = path.join(__dirname, "..", "data", "players_with_stops.json");
const LOG_PATH = path.join(__dirname, "..", "data", "fetchCareerStops.log.json");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Common country / nationality adjectives, used to detect and drop
// national-team "clubs" (e.g. TheSportsDB listing "Argentina" as a former
// team for Messi) from career stop results.
const NATIONALITY_WORDS = new Set([
  "argentina", "brazil", "brazilian", "portugal", "portuguese", "france", "french",
  "germany", "german", "spain", "spanish", "england", "english", "italy", "italian",
  "netherlands", "dutch", "belgium", "belgian", "croatia", "croatian", "uruguay",
  "uruguayan", "colombia", "colombian", "chile", "chilean", "mexico", "mexican",
  "usa", "united states", "sweden", "swedish", "norway", "norwegian", "poland",
  "polish", "egypt", "egyptian", "senegal", "senegalese", "ghana", "ghanaian",
  "nigeria", "nigerian", "cameroon", "cameroonian", "ivory coast", "morocco",
  "moroccan", "algeria", "algerian", "japan", "japanese", "south korea", "korean",
  "denmark", "danish", "serbia", "serbian", "wales", "welsh", "scotland", "scottish",
  "canada", "canadian", "australia", "australian", "ecuador", "ecuadorian",
  "gabon", "togo", "liberia", "georgia", "georgian", "czech republic", "czech",
]);

// Sub-national representative teams (not full national teams, but also not
// real clubs) — TheSportsDB sometimes lists these as "former teams" too.
const REGIONAL_REP_TEAMS = new Set([
  "catalonia", "basque country", "andalusia", "galicia",
]);

function isLikelyNationalTeam(clubName) {
  const lower = clubName.trim().toLowerCase();
  if (NATIONALITY_WORDS.has(lower)) return true;
  if (REGIONAL_REP_TEAMS.has(lower)) return true;
  // "Argentina U20", "Brazil U-23", "Spain Olympic" etc.
  const stripped = lower.replace(/\s*(u-?\d{2}|olympic|national team)\s*$/i, "").trim();
  return NATIONALITY_WORDS.has(stripped) || REGIONAL_REP_TEAMS.has(stripped);
}

// Levenshtein edit distance, used as a name-similarity gate before trusting
// a single search result as the correct player.
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function nameSimilarity(a, b) {
  const na = a.trim().toLowerCase();
  const nb = b.trim().toLowerCase();
  if (na === nb) return 1;
  const dist = levenshtein(na, nb);
  return 1 - dist / Math.max(na.length, nb.length);
}

const MIN_NAME_SIMILARITY = 0.6;

async function fetchJson(url, retriesLeft = 3) {
  const res = await fetch(url);
  if (res.status === 429) {
    if (retriesLeft <= 0) throw new Error(`HTTP 429 for ${url} (out of retries)`);
    const retryAfterSec = parseInt(res.headers.get("retry-after") || "15", 10);
    console.log(`\n  Rate limited, waiting ${retryAfterSec}s...`);
    await sleep((retryAfterSec + 1) * 1000);
    return fetchJson(url, retriesLeft - 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function searchPlayer(name) {
  const q = encodeURIComponent(name.replace(/'/g, "").trim());
  const data = await fetchJson(`${SPORTSDB_BASE}/searchplayers.php?p=${q}`);
  return data.player || [];
}

async function getFormerTeams(playerId) {
  const data = await fetchJson(`${SPORTSDB_BASE}/lookupformerteams.php?id=${playerId}`);
  return data.formerteams || [];
}

async function getPlayerProfile(playerId) {
  const data = await fetchJson(`${SPORTSDB_BASE}/lookupplayer.php?id=${playerId}`);
  return (data.players && data.players[0]) || null;
}

async function getTeamLocation(teamId) {
  const data = await fetchJson(`${SPORTSDB_BASE}/lookupteam.php?id=${teamId}`);
  const team = data.teams && data.teams[0];
  return team ? team.strLocation : null;
}

const geocodeCache = {};

async function geocodeLocation(locationStr) {
  if (!locationStr) return null;
  if (geocodeCache[locationStr]) return geocodeCache[locationStr];

  await sleep(NOMINATIM_DELAY_MS);
  const q = encodeURIComponent(locationStr);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "wordle-cup-data-pipeline/1.0 (one-time dev seed script)" },
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (!results.length) return null;
    const result = { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
    geocodeCache[locationStr] = result;
    return result;
  } catch {
    return null;
  }
}

// Picks the best matching search result: prefer soccer players, prefer
// nationality match when the seed data specifies one, and require the
// candidate's name to actually resemble the seed name (catches cases like
// "Pelé" search returning an unrelated "Bryan Pele").
function pickBestMatch(candidates, seedPlayer, log) {
  const soccerOnly = candidates.filter((c) => c.strSport === "Soccer");
  const pool = soccerOnly.length ? soccerOnly : candidates;
  if (pool.length === 0) return null;

  const withSimilarity = pool.map((c) => ({
    candidate: c,
    similarity: nameSimilarity(c.strPlayer || "", seedPlayer.name),
  }));

  const plausible = withSimilarity.filter((w) => w.similarity >= MIN_NAME_SIMILARITY);
  if (plausible.length === 0) {
    log.push({
      level: "warn",
      msg: `No name-similar match for "${seedPlayer.name}" (${seedPlayer.id}) — best candidate was "${pool[0].strPlayer}" (similarity too low, skipped)`,
    });
    return null;
  }

  if (plausible.length === 1) return plausible[0].candidate;

  const natMatch = plausible.filter(
    (w) =>
      w.candidate.strNationality &&
      seedPlayer.nationality &&
      w.candidate.strNationality.toLowerCase().includes(seedPlayer.nationality.toLowerCase())
  );
  if (natMatch.length === 1) return natMatch[0].candidate;

  const sorted = (natMatch.length > 1 ? natMatch : plausible).sort(
    (a, b) => b.similarity - a.similarity || parseFloat(b.candidate.relevance || 0) - parseFloat(a.candidate.relevance || 0)
  );
  return sorted[0].candidate;
}

async function resolveCareerStops(formerTeams, log) {
  // former teams come back newest-first typically; sort by joined year ascending
  const sorted = [...formerTeams].sort((a, b) => {
    const ay = parseInt(a.strJoined, 10) || 9999;
    const by = parseInt(b.strJoined, 10) || 9999;
    return ay - by;
  });

  // Drop national-team entries (e.g. "Argentina") — these aren't club stops.
  const clubsOnly = sorted.filter((team) => {
    const clubName = (team.strFormerTeam || "").trim();
    if (!clubName) return false;
    if (isLikelyNationalTeam(clubName)) {
      log.push({ level: "info", msg: `Dropped likely national-team entry "${clubName}"` });
      return false;
    }
    return true;
  });

  // Collapse consecutive stints at the same club (e.g. Youth -> B team ->
  // first team all at Barcelona) into a single stop spanning the full range.
  // Also treats "Club" and "Club B" / "Club II" reserve-team variants as the
  // same stop, since they represent one continuous stint at that club.
  function baseClubName(name) {
    return name.trim().replace(/\s+(B|II|U-?\d{2})$/i, "").trim();
  }
  const collapsed = [];
  for (const team of clubsOnly) {
    const clubName = team.strFormerTeam.trim();
    const prev = collapsed[collapsed.length - 1];
    if (prev && baseClubName(prev.strFormerTeam) === baseClubName(clubName)) {
      prev.strDeparted = team.strDeparted || prev.strDeparted;
      continue;
    }
    collapsed.push({ ...team });
  }

  const stops = [];
  let order = 1;
  for (const team of collapsed) {
    const clubName = (team.strFormerTeam || "").trim();
    if (!clubName) continue;

    let coords = lookupClubCoords(clubName);
    if (!coords) {
      const location = await getTeamLocation(team.idFormerTeam).catch(() => null);
      await sleep(REQUEST_DELAY_MS);
      const geo = location ? await geocodeLocation(location) : null;
      if (geo) {
        coords = { lat: geo.lat, lng: geo.lng, country: null, countryCode: null };
        log.push({ level: "info", msg: `Geocoded "${clubName}" via "${location}"` });
      }
    }

    if (!coords) {
      log.push({ level: "warn", msg: `No coordinates found for club "${clubName}"` });
      continue;
    }

    const years =
      team.strJoined && team.strDeparted
        ? `${team.strJoined}–${team.strDeparted}`
        : team.strJoined
        ? `${team.strJoined}–present`
        : "";

    stops.push({
      order: order++,
      club: clubName,
      country: coords.country || "",
      countryCode: coords.countryCode || "",
      lat: coords.lat,
      lng: coords.lng,
      years,
      note: team.strMoveType === "Youth" ? "Youth" : team.strMoveType === "Loan" ? "Loan" : undefined,
    });
  }
  return stops;
}

async function processPlayer(seedPlayer, log) {
  const candidates = await searchPlayer(seedPlayer.name);
  await sleep(REQUEST_DELAY_MS);

  if (candidates.length === 0) {
    log.push({ level: "warn", msg: `No search results for "${seedPlayer.name}" (${seedPlayer.id})` });
    return { ...seedPlayer, careerStops: [], _status: "not_found" };
  }

  const match = pickBestMatch(candidates, seedPlayer, log);
  if (!match) {
    log.push({ level: "warn", msg: `No confident match for "${seedPlayer.name}" (${seedPlayer.id}), ${candidates.length} candidates` });
    return { ...seedPlayer, careerStops: [], _status: "ambiguous", _candidates: candidates.length };
  }

  const isAmbiguous = candidates.length > 1 && !candidates.every((c) => c.idPlayer === match.idPlayer);
  if (isAmbiguous) {
    log.push({
      level: "flag",
      msg: `Picked "${match.strPlayer}" (${match.idPlayer}, ${match.strNationality}) for seed "${seedPlayer.name}" out of ${candidates.length} candidates — verify`,
    });
  }

  const [formerTeams, profile] = await Promise.all([
    getFormerTeams(match.idPlayer).catch(() => []),
    getPlayerProfile(match.idPlayer).catch(() => null),
  ]);
  await sleep(REQUEST_DELAY_MS);

  const careerStops = await resolveCareerStops(formerTeams, log);

  const birthYear = profile && profile.dateBorn ? parseInt(profile.dateBorn.slice(0, 4), 10) : undefined;

  return {
    ...seedPlayer,
    birthYear: birthYear || undefined,
    careerStops,
    _status: careerStops.length >= 2 ? "ok" : "thin",
    _sportsDbId: match.idPlayer,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const startArg = args.find((a) => a.startsWith("--start="));
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const idsArg = args.find((a) => a.startsWith("--ids="));
  const start = startArg ? parseInt(startArg.split("=")[1], 10) : 0;
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 20;

  const allPlayers = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));

  let batch;
  if (idsArg) {
    const ids = new Set(idsArg.split("=")[1].split(",").map((s) => s.trim()));
    batch = allPlayers.filter((p) => ids.has(p.id));
    console.log(`Retrying ${batch.length} of ${ids.size} requested IDs...`);
  } else {
    batch = allPlayers.slice(start, start + limit);
    console.log(`Processing players ${start} to ${start + batch.length - 1} of ${allPlayers.length}...`);
  }

  const existing = fs.existsSync(OUTPUT_PATH)
    ? JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"))
    : [];
  const existingById = new Map(existing.map((p) => [p.id, p]));

  const log = [];

  for (const seedPlayer of batch) {
    process.stdout.write(`  ${seedPlayer.name}... `);
    try {
      const result = await processPlayer(seedPlayer, log);
      existingById.set(result.id, result);
      console.log(`${result._status} (${result.careerStops.length} stops)`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      log.push({ level: "error", msg: `${seedPlayer.name}: ${err.message}` });
    }

    // checkpoint after every player
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify([...existingById.values()], null, 2), "utf8");
  }

  const existingLog = fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, "utf8")) : [];
  fs.writeFileSync(LOG_PATH, JSON.stringify([...existingLog, ...log], null, 2), "utf8");

  console.log(`\nDone. Output: ${OUTPUT_PATH}`);
  console.log(`Log entries this run: ${log.length} (see ${LOG_PATH})`);
  const flagged = log.filter((l) => l.level === "flag" || l.level === "warn").length;
  if (flagged) console.log(`  ${flagged} entries need review (ambiguous matches / missing coords).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
