// One-off script to seed the `playerRoster` Firestore collection from
// data/players_seed_list.json. Kept separate from `locationPuzzles` (the live,
// playable puzzle pool) since roster entries don't have careerStops yet.
//
// Usage: node scripts/seedPlayerRoster.js
// Requires .secrets/service-account.json (gitignored).

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const serviceAccountPath = path.join(__dirname, "..", ".secrets", "service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Missing service account key at ${serviceAccountPath}`);
  console.error("Generate one via Firebase Console > Project Settings > Service Accounts.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function main() {
  const seedPath = path.join(__dirname, "..", "data", "players_seed_list.json");
  const players = JSON.parse(fs.readFileSync(seedPath, "utf8"));

  console.log(`Seeding ${players.length} players into playerRoster...`);

  const batchSize = 400; // Firestore batch write limit is 500
  for (let i = 0; i < players.length; i += batchSize) {
    const batch = db.batch();
    const chunk = players.slice(i, i + batchSize);
    for (const player of chunk) {
      const ref = db.collection("playerRoster").doc(player.id);
      batch.set(ref, player, { merge: true });
    }
    await batch.commit();
    console.log(`  committed ${Math.min(i + batchSize, players.length)} / ${players.length}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
