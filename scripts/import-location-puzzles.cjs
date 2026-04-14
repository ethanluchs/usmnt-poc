#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const admin = require('firebase-admin');

const DEFAULT_COLLECTION = 'locationPuzzles';
const MAX_BATCH_SIZE = 400;

function parseArgs(argv) {
  const args = {
    source: path.resolve(process.cwd(), 'lib/mockData.js'),
    collection: DEFAULT_COLLECTION,
    dryRun: false,
    allowMissingCoords: false,
    projectId: process.env.FIREBASE_PROJECT_ID || undefined,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }

    if (arg === '--allow-missing-coords') {
      args.allowMissingCoords = true;
      continue;
    }

    if (arg === '--source') {
      args.source = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg === '--collection') {
      args.collection = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--project') {
      args.projectId = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printHelpAndExit(0);
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return args;
}

function printHelpAndExit(code) {
  console.log(`
Import location puzzles into Firestore.

Usage:
  node scripts/import-location-puzzles.cjs [options]

Options:
  --source <path>               Input source file (.js/.mjs/.cjs/.json). Default: lib/mockData.js
  --collection <name>           Firestore collection name. Default: locationPuzzles
  --project <projectId>         Firebase project id override
  --dry-run                     Validate and print, but do not write to Firestore
  --allow-missing-coords        Allow career stops without lat/lng (for manual completion later)
  --help, -h                    Show this help text

Environment:
  FIREBASE_SERVICE_ACCOUNT_PATH Optional path to a service-account JSON file
  FIREBASE_SERVICE_ACCOUNT_JSON Optional raw JSON service-account credentials
  GOOGLE_APPLICATION_CREDENTIALS Optional path used by ADC
  FIREBASE_PROJECT_ID           Optional project id fallback
  `);
  process.exit(code);
}

async function loadInput(sourcePath) {
  const ext = path.extname(sourcePath).toLowerCase();

  if (ext === '.json') {
    const text = fs.readFileSync(sourcePath, 'utf8');
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (Array.isArray(parsed.MOCK_PLAYERS)) {
      return parsed.MOCK_PLAYERS;
    }
    throw new Error('JSON source must be an array or an object containing MOCK_PLAYERS array');
  }

  if (['.js', '.mjs', '.cjs'].includes(ext)) {
    const imported = await import(pathToFileURL(sourcePath).href);
    if (Array.isArray(imported.MOCK_PLAYERS)) {
      return imported.MOCK_PLAYERS;
    }
    if (Array.isArray(imported.default)) {
      return imported.default;
    }
    if (imported.default && Array.isArray(imported.default.MOCK_PLAYERS)) {
      return imported.default.MOCK_PLAYERS;
    }
    throw new Error('JS source must export MOCK_PLAYERS (or default array)');
  }

  throw new Error(`Unsupported source extension: ${ext}`);
}

function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validatePlayers(players, { allowMissingCoords }) {
  const errors = [];
  const seenIds = new Set();

  if (!Array.isArray(players) || players.length === 0) {
    errors.push('Input has no players.');
    return errors;
  }

  players.forEach((player, idx) => {
    const prefix = `player[${idx}]`;

    if (!player || typeof player !== 'object') {
      errors.push(`${prefix} is not an object`);
      return;
    }

    const requiredTopLevel = ['id', 'name', 'nationality', 'position', 'birthYear', 'careerStops'];
    requiredTopLevel.forEach((key) => {
      if (player[key] === undefined || player[key] === null || player[key] === '') {
        errors.push(`${prefix}.${key} is required`);
      }
    });

    if (typeof player.id === 'string') {
      if (seenIds.has(player.id)) {
        errors.push(`${prefix}.id is duplicated: ${player.id}`);
      }
      seenIds.add(player.id);
    }

    if (!Array.isArray(player.careerStops) || player.careerStops.length === 0) {
      errors.push(`${prefix}.careerStops must be a non-empty array`);
      return;
    }

    player.careerStops.forEach((stop, stopIdx) => {
      const stopPrefix = `${prefix}.careerStops[${stopIdx}]`;
      const requiredStop = ['order', 'club', 'country', 'countryCode'];
      requiredStop.forEach((key) => {
        if (stop?.[key] === undefined || stop?.[key] === null || stop?.[key] === '') {
          errors.push(`${stopPrefix}.${key} is required`);
        }
      });

      if (!allowMissingCoords) {
        if (!isValidNumber(stop?.lat)) {
          errors.push(`${stopPrefix}.lat must be a finite number`);
        }
        if (!isValidNumber(stop?.lng)) {
          errors.push(`${stopPrefix}.lng must be a finite number`);
        }
      } else {
        if (stop?.lat !== undefined && stop?.lat !== null && !isValidNumber(stop.lat)) {
          errors.push(`${stopPrefix}.lat must be a finite number when provided`);
        }
        if (stop?.lng !== undefined && stop?.lng !== null && !isValidNumber(stop.lng)) {
          errors.push(`${stopPrefix}.lng must be a finite number when provided`);
        }
      }
    });
  });

  return errors;
}

function getCredentialFromEnv() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const raw = fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8');
    return admin.credential.cert(JSON.parse(raw));
  }

  return admin.credential.applicationDefault();
}

function sanitizePlayer(player) {
  const stops = [...player.careerStops]
    .sort((a, b) => a.order - b.order)
    .map((stop) => {
      const base = {
        order: stop.order,
        club: stop.club,
        country: stop.country,
        countryCode: stop.countryCode,
      };

      if (stop.years !== undefined) base.years = stop.years;
      if (stop.note !== undefined) base.note = stop.note;
      if (stop.city !== undefined) base.city = stop.city;
      if (isValidNumber(stop.lat)) base.lat = stop.lat;
      if (isValidNumber(stop.lng)) base.lng = stop.lng;

      return base;
    });

  return {
    id: player.id,
    name: player.name,
    nationality: player.nationality,
    position: player.position,
    birthYear: player.birthYear,
    careerStops: stops,
  };
}

async function upsertPlayers(db, collection, players) {
  let batch = db.batch();
  let inBatch = 0;
  let writes = 0;

  for (const player of players) {
    const docRef = db.collection(collection).doc(player.id);
    batch.set(
      docRef,
      {
        ...sanitizePlayer(player),
        _importedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    inBatch += 1;
    writes += 1;

    if (inBatch >= MAX_BATCH_SIZE) {
      await batch.commit();
      batch = db.batch();
      inBatch = 0;
    }
  }

  if (inBatch > 0) {
    await batch.commit();
  }

  return writes;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(args.source)) {
    throw new Error(`Source file not found: ${args.source}`);
  }

  const players = await loadInput(args.source);
  const errors = validatePlayers(players, { allowMissingCoords: args.allowMissingCoords });

  if (errors.length > 0) {
    console.error('\nValidation failed:\n');
    errors.slice(0, 40).forEach((e) => console.error(`- ${e}`));
    if (errors.length > 40) {
      console.error(`- ...and ${errors.length - 40} more`);
    }
    process.exit(1);
  }

  console.log(`\nLoaded ${players.length} players from ${args.source}`);
  console.log(`Target collection: ${args.collection}`);

  if (args.dryRun) {
    console.log('\nDry run mode: no writes performed.');
    console.log(`Sample IDs: ${players.slice(0, 10).map((p) => p.id).join(', ')}`);
    return;
  }

  const app = admin.initializeApp({
    credential: getCredentialFromEnv(),
    projectId: args.projectId,
  });
  const db = app.firestore();

  const writes = await upsertPlayers(db, args.collection, players);
  console.log(`\nDone. Upserted ${writes} documents into ${args.collection}.`);
}

main().catch((err) => {
  console.error('\nImport failed.');
  console.error(err?.stack || err?.message || err);
  process.exit(1);
});
