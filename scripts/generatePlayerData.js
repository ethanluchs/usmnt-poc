#!/usr/bin/env node

/**
 * AI-Assisted Player Career Data Generator
 * Uses OpenAI GPT-4o-mini to research player careers and generate structured JSON
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { getCountryCode } = require('./countryCodeMap');
const { geocodeCity } = require('./geocoding');

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o-mini';
const PLAYER_DATA_DIR = path.join(__dirname, '..', 'player_loc_data');
const CLUB_LOOKUP_PATH = path.join(PLAYER_DATA_DIR, 'club_lookup.json');

// Validate environment
if (!OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable not set');
  console.error('Please set your OpenAI API key:');
  console.error('  export OPENAI_API_KEY=your-api-key-here');
  process.exit(1);
}

/**
 * Load or initialize club lookup cache
 */
async function loadClubLookup() {
  try {
    const data = await fs.readFile(CLUB_LOOKUP_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}; // File doesn't exist yet
    }
    console.error('Warning: Failed to load club_lookup.json:', error.message);
    return {};
  }
}

/**
 * Save club lookup cache
 */
async function saveClubLookup(clubLookup) {
  try {
    await fs.writeFile(
      CLUB_LOOKUP_PATH,
      JSON.stringify(clubLookup, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Error saving club_lookup.json:', error.message);
  }
}

/**
 * Call OpenAI API to research player career
 */
async function researchPlayerCareer(playerName, teamNationality) {
  const systemPrompt = `You are a soccer/football historian with expert knowledge of player careers. 
Your task is to research a player's professional career and return structured data about their career stops (clubs they've played for).

For each career stop, include:
- Club name (official name)
- City where the club is located
- Country
- Years played (e.g., "2016-2020" or "2023" or "2023-present")
- Optional note (e.g., "Loan", "Academy", "Youth")

Rules:
1. Include youth academy/development clubs if they're notable (age 16+)
2. List clubs in chronological order
3. For loan spells, add note: "Loan"
4. For academy/youth periods, add note: "Academy"
5. If a player returned to a club, list it as a separate entry
6. Use official club names (e.g., "FC Barcelona" not "Barcelona")
7. City should be where the club is based (e.g., "Turin" for Juventus, not "Torino")
8. Years should cover the actual playing period
9. For current clubs, use "present" as end year

Return ONLY valid JSON in this format:
{
  "careerStops": [
    {"club": "FC Dallas", "city": "Frisco", "country": "USA", "years": "2009-2016", "note": "Academy"},
    {"club": "Schalke 04", "city": "Gelsenkirchen", "country": "Germany", "years": "2016-2020"}
  ]
}`;

  const userPrompt = `Research the career of soccer player "${playerName}" (nationality: ${teamNationality}). 
Return their career stops in chronological order as JSON.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Track token usage
    const usage = data.usage;
    console.log(`  Tokens: ${usage.total_tokens} (input: ${usage.prompt_tokens}, output: ${usage.completion_tokens})`);

    return parsed.careerStops || [];
  } catch (error) {
    console.error(`Error researching ${playerName}:`, error.message);
    return null;
  }
}

/**
 * Get or fetch club location data
 */
async function getClubLocation(clubName, city, country, clubLookup) {
  // Check cache first
  if (clubLookup[clubName]) {
    return clubLookup[clubName];
  }

  console.log(`  Geocoding ${clubName} (${city}, ${country})...`);

  // Geocode the city
  const coords = await geocodeCity(city, country);
  if (!coords) {
    console.warn(`  ⚠️  Failed to geocode ${city}, ${country}`);
    return null;
  }

  // Get country code
  const countryCode = getCountryCode(country);
  if (!countryCode) {
    console.warn(`  ⚠️  Unknown country code for: ${country}`);
    return null;
  }

  // Build club data
  const clubData = {
    country,
    countryCode,
    city,
    lat: coords.lat,
    lng: coords.lng,
  };

  // Cache it
  clubLookup[clubName] = clubData;

  return clubData;
}

/**
 * Generate player ID from name
 */
function generatePlayerId(name) {
  const parts = name.toLowerCase().split(' ');
  if (parts.length >= 2) {
    const lastName = parts[parts.length - 1];
    const firstName = parts[0];
    return `${lastName}-${firstName}-loc`;
  }
  return `${parts[0]}-loc`;
}

/**
 * Process a single player
 */
async function processPlayer(playerName, teamNationality, position, clubLookup) {
  console.log(`\n🔍 Researching: ${playerName}`);

  // Research career with AI
  const careerStops = await researchPlayerCareer(playerName, teamNationality);
  if (!careerStops || careerStops.length === 0) {
    console.error(`❌ Failed to research career for ${playerName}`);
    return null;
  }

  console.log(`  Found ${careerStops.length} career stops`);

  // Process each career stop
  const processedStops = [];
  for (let i = 0; i < careerStops.length; i++) {
    const stop = careerStops[i];
    const clubData = await getClubLocation(stop.club, stop.city, stop.country, clubLookup);

    if (!clubData) {
      console.error(`  ❌ Skipping ${stop.club} - location data unavailable`);
      continue;
    }

    processedStops.push({
      order: i + 1,
      club: stop.club,
      country: clubData.country,
      countryCode: clubData.countryCode,
      lat: clubData.lat,
      lng: clubData.lng,
      years: stop.years,
      ...(stop.note && { note: stop.note }),
    });
  }

  if (processedStops.length === 0) {
    console.error(`❌ No valid career stops for ${playerName}`);
    return null;
  }

  // Build player object
  const playerData = {
    id: generatePlayerId(playerName),
    name: playerName,
    nationality: teamNationality,
    position: position,
    careerStops: processedStops,
  };

  console.log(`✅ Completed: ${playerName} (${processedStops.length} stops)`);
  return playerData;
}

/**
 * Interactive CLI prompt
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Main function
 */
async function main() {
  console.log('⚽ AI-Assisted World Cup Player Data Generator');
  console.log('============================================\n');

  // Get team info
  const teamCode = await prompt('Team code (e.g., usa, arg, bra): ');
  const teamName = await prompt('Team name (e.g., USA, Argentina, Brazil): ');
  const teamNationality = await prompt('Team nationality (e.g., USA, Argentina, Brazil): ');

  // Get players
  console.log('\nEnter player names (one per line, empty line when done):');
  const players = [];
  while (true) {
    const name = await prompt(`Player ${players.length + 1}: `);
    if (!name) break;
    
    const position = await prompt('  Position (GK/DF/MF/FW): ');
    
    players.push({ name, position: position.toUpperCase() });
  }

  if (players.length === 0) {
    console.log('No players entered. Exiting.');
    return;
  }

  console.log(`\n📊 Processing ${players.length} players for ${teamName}...`);

  // Load club lookup
  const clubLookup = await loadClubLookup();
  console.log(`Loaded ${Object.keys(clubLookup).length} clubs from cache\n`);

  // Process each player
  const playerData = [];
  for (const player of players) {
    const data = await processPlayer(
      player.name,
      teamNationality,
      player.position,
      clubLookup
    );
    if (data) {
      playerData.push(data);
    }
  }

  // Save club lookup
  await saveClubLookup(clubLookup);
  console.log(`\n💾 Saved ${Object.keys(clubLookup).length} clubs to cache`);

  // Save team data
  const outputPath = path.join(PLAYER_DATA_DIR, `${teamCode}_players.json`);
  await fs.writeFile(outputPath, JSON.stringify(playerData, null, 2), 'utf-8');
  console.log(`\n✅ Generated ${playerData.length} players: ${outputPath}`);

  // Cost estimate (approximate)
  const avgTokensPerPlayer = 500;
  const totalTokens = players.length * avgTokensPerPlayer;
  const costPer1kTokens = 0.00015; // GPT-4o-mini input cost
  const estimatedCost = (totalTokens / 1000) * costPer1kTokens;
  console.log(`\n💰 Estimated cost: $${estimatedCost.toFixed(4)}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
