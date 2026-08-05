// Applies hand-written career-stop corrections for tier-1 players that came
// back below the 4-stop minimum from the automated fetchCareerStops.js pass.
// Overwrites careerStops/birthYear entirely for each patched id (not a merge)
// since several entries had ordering/accuracy issues worth a clean rewrite.

const fs = require("fs");
const path = require("path");

const OUTPUT_PATH = path.join(__dirname, "..", "data", "players_with_stops.json");
const PATCHES_PATH = path.join(__dirname, "tier1Patches.json");

const data = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
const patches = JSON.parse(fs.readFileSync(PATCHES_PATH, "utf8"));

let applied = 0;
let stillBelowMin = [];

const patchedIds = new Set(Object.keys(patches));
for (const player of data) {
  if (!patchedIds.has(player.id)) continue;
  const patch = patches[player.id];
  player.careerStops = patch.careerStops;
  if (patch.birthYear) player.birthYear = patch.birthYear;
  player._status = player.careerStops.length >= 4 ? "ok" : "manual_review";
  delete player._candidates;
  applied++;
  if (player.careerStops.length < 4) stillBelowMin.push(player.name);
}

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), "utf8");

console.log(`Applied ${applied} of ${patchedIds.size} patches.`);
const missingIds = [...patchedIds].filter((id) => !data.some((p) => p.id === id));
if (missingIds.length) {
  console.log(`WARNING: ${missingIds.length} patch ids not found in data:`, missingIds);
}
if (stillBelowMin.length) {
  console.log(`Still below 4 stops after patch:`, stillBelowMin);
} else {
  console.log("All patched players now meet the 4-stop minimum.");
}
