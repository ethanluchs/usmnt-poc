# Quick Start Guide: AI Player Data Generation

Generate structured player career data for World Cup teams using GPT-4o-mini.

## 🚀 Quick Start

### 1. Get an OpenAI API Key

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy it to your clipboard

### 2. Set the API Key

```bash
export OPENAI_API_KEY=your-api-key-here
```

Or create a `.env` file:
```bash
cp .env.example .env
# Edit .env and paste your API key
```

### 3. Run the Generator

```bash
npm run generate-players
```

### 4. Follow the Prompts

```
Team code: usa
Team name: USA  
Team nationality: USA

Player 1: Christian Pulisic
  Position: FW

Player 2: Tyler Adams
  Position: MF

Player 3: [Press Enter to finish]
```

### 5. Check Output

Generated files:
- `player_loc_data/usa_players.json` - Your team's player data
- `player_loc_data/club_lookup.json` - Club location cache (reused for future teams)

## 💰 Cost

**~$0.10-0.30 per team** (10-12 players)

Free $5 credits from OpenAI cover ~20-50 teams.

## 📖 Full Documentation

See [scripts/README.md](scripts/README.md) for detailed documentation.

## 🧪 Test Setup

Validate helpers work correctly:

```bash
node scripts/test.js
```

## 🎯 Next Steps

1. Generate data for your first team
2. Review the JSON output
3. Verify a few player careers are accurate
4. Upload to Firebase (script coming soon)
5. Test in the game UI

## 📝 Example Output

See [player_loc_data/example_players.json](player_loc_data/example_players.json) for expected format.

## ❓ Troubleshooting

**"OPENAI_API_KEY environment variable not set"**
- Make sure you exported the key in your current terminal session
- Or create a `.env` file with the key

**Need help?**
- Check [scripts/README.md](scripts/README.md) for detailed docs
- Run `node scripts/test.js` to validate setup
