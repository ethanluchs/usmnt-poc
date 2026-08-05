// Promotes verified players (>= 4 career stops) from data/players_with_stops.json
// into the live `locationPuzzles` Firestore collection — the pool the game
// actually reads from. Only writes the fields the Player type expects;
// internal pipeline fields (_status, _sportsDbId, fameTier, etc.) are dropped.
//
// Usage: node scripts/promoteToLocationPuzzles.js
// Requires .secrets/service-account.json (gitignored).

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPath = path.join(__dirname, "..", ".secrets", "service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Missing service account key at ${serviceAccountPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const MIN_STOPS = 4;

function toPlayerDoc(p) {
  return {
    id: p.id,
    name: p.name,
    nationality: p.nationality,
    position: p.position,
    ...(p.birthYear ? { birthYear: p.birthYear } : {}),
    careerStops: p.careerStops.map((s) => ({
      order: s.order,
      club: s.club,
      country: s.country || "",
      countryCode: s.countryCode || "",
      lat: s.lat,
      lng: s.lng,
      years: s.years || "",
      ...(s.note ? { note: s.note } : {}),
    })),
  };
}

async function main() {
  const dataPath = path.join(__dirname, "..", "data", "players_with_stops.json");
  const all = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const ready = all.filter((p) => p.careerStops && p.careerStops.length >= MIN_STOPS);

  console.log(`${ready.length} of ${all.length} players meet the ${MIN_STOPS}-stop minimum.`);
  console.log(`Promoting to locationPuzzles...`);

  const batchSize = 400;
  for (let i = 0; i < ready.length; i += batchSize) {
    const batch = db.batch();
    const chunk = ready.slice(i, i + batchSize);
    for (const player of chunk) {
      const ref = db.collection("locationPuzzles").doc(player.id);
      batch.set(ref, toPlayerDoc(player), { merge: true });
    }
    await batch.commit();
    console.log(`  committed ${Math.min(i + batchSize, ready.length)} / ${ready.length}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
