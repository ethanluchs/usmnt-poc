# Player Data Generation Scripts

AI-assisted tools for generating structured player career data for World Cup teams using OpenAI GPT-4o-mini.

## Prerequisites

1. **Node.js** installed (v18+ recommended)
2. **OpenAI API Key** - Get one from [platform.openai.com](https://platform.openai.com/api-keys)

## Setup

### 1. Set your OpenAI API key

```bash
export OPENAI_API_KEY=your-api-key-here
```

Or add to your `.env` file (not committed to git):
```
OPENAI_API_KEY=your-api-key-here
```

### 2. Run the generator

```bash
npm run generate-players
```

## Usage

The script will prompt you for:

1. **Team code** (e.g., `usa`, `arg`, `ger`) - used for the output filename
2. **Team name** (e.g., `USA`, `Argentina`, `Germany`)
3. **Team nationality** (e.g., `USA`, `Argentina`, `Germany`) - used for player nationality field
4. **Players** - for each player, enter:
   - Full name (e.g., `Weston McKennie`)
   - Position: `GK`, `DF`, `MF`, or `FW`

Press Enter without typing a name when you're done adding players.

### Example Session

```
⚽ AI-Assisted World Cup Player Data Generator
============================================

Team code (e.g., usa, arg, bra): usa
Team name (e.g., USA, Argentina, Brazil): USA
Team nationality (e.g., USA, Argentina, Brazil): USA

Enter player names (one per line, empty line when done):
Player 1: Christian Pulisic
  Position (GK/DF/MF/FW): FW
Player 2: Tyler Adams
  Position (GK/DF/MF/FW): MF
Player 3: [Press Enter]

📊 Processing 2 players for USA...
```

## Output

The script generates two files:

1. **`player_loc_data/{team_code}_players.json`** - Array of player career data
   - Example: `player_loc_data/usa_players.json`
   - Contains all players for that team with their career stops

2. **`player_loc_data/club_lookup.json`** - Club location cache (updated)
   - Stores club → {city, country, countryCode, lat, lng} mappings
   - Reused across all teams to avoid duplicate geocoding

## Data Structure

Each player follows this schema:

```json
{
  "id": "pulisic-christian-loc",
  "name": "Christian Pulisic",
  "nationality": "USA",
  "position": "FW",
  "careerStops": [
    {
      "order": 1,
      "club": "PA Classics",
      "country": "USA",
      "countryCode": "840",
      "lat": 40.4406,
      "lng": -79.9959,
      "years": "2005-2015",
      "note": "Academy"
    },
    {
      "order": 2,
      "club": "Borussia Dortmund",
      "country": "Germany",
      "countryCode": "276",
      "lat": 51.4818,
      "lng": 7.2162,
      "years": "2015-2019"
    }
  ]
}
```

## Cost Estimation

**GPT-4o-mini pricing** (as of 2024):
- Input: $0.00015 per 1K tokens
- Output: $0.0006 per 1K tokens

**Estimated costs:**
- ~500-800 tokens per player
- **~$0.01-0.03 per player**
- **~$0.10-0.30 per team** (10-12 players)
- **~$5-10 for all 32 World Cup teams**

The script displays token usage and cost estimates after completion.

## How It Works

1. **Career Research**: GPT-4o-mini researches each player's professional career
2. **Club Caching**: Checks `club_lookup.json` for existing club locations
3. **Geocoding**: For new clubs, uses OpenStreetMap Nominatim API (free, city-level coordinates)
4. **Country Codes**: Maps country names to ISO 3166-1 numeric codes
5. **Validation**: Ensures all required fields are present
6. **Output**: Saves team JSON file and updates club cache

## Files

- **`generatePlayerData.js`** - Main CLI script
- **`countryCodeMap.js`** - ISO 3166-1 country code mappings
- **`geocoding.js`** - Nominatim geocoding helper (city-level coordinates)

## Tips

- **Be specific with names** - Use full names (e.g., "Weston McKennie" not "McKennie")
- **Check club_lookup.json** - Review geocoded clubs periodically for accuracy
- **Start small** - Test with 1-2 players first to verify output
- **Rate limits** - Nominatim API has 1 request/second limit (handled automatically)
- **Preview data** - Check generated JSON before uploading to Firebase

## Troubleshooting

**"OPENAI_API_KEY environment variable not set"**
- Make sure you've exported the API key in your terminal session

**Geocoding failures**
- Some cities may not geocode correctly
- Check the output for warnings
- Manually verify coordinates for critical clubs

**Country code not found**
- Add missing countries to `countryCodeMap.js`
- Submit a PR or open an issue

**API rate limits**
- OpenAI: Default rate limits vary by account tier
- Nominatim: 1 request/second (automatically throttled)

## Next Steps

After generating player data:

1. **Review** the generated JSON files for accuracy
2. **Verify** coordinates on a map (check a few manually)
3. **Upload** to Firebase using the upload script (TBD)
4. **Test** in the game UI to ensure proper rendering

## License

MIT
