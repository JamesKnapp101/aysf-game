# Claude AI Integration Setup Guide

This guide explains how to set up and use the Claude AI-powered NPC conversation system for Kevin (the radio voice).

## Overview

The game now integrates with Claude AI to provide dynamic, context-aware conversations with NPCs. Instead of pre-written dialog for every possible question, Claude generates responses based on the character's profile, knowledge, and conversation history.

## Prerequisites

- Node.js 18+ installed
- An Anthropic API key (get one at https://console.anthropic.com/)
- pnpm installed (or npm/yarn)

## Installation Steps

### 1. Install Server Dependencies

```bash
cd server
pnpm install
```

### 2. Create Environment File

Copy the example environment file and add your API key:

```bash
cd server
copy .env.example .env.local
```

Edit `server/.env.local` and add your actual API key:

```env
ANTHROPIC_API_KEY=replace-with-your-anthropic-api-key
PORT=3001
NODE_ENV=development
```

**IMPORTANT:** Never commit `.env.local` to git! It's already in `.gitignore`.

### 3. Install Frontend Dependencies

```bash
cd ..
pnpm install
```

## Running the Game with Claude

### Quick Start (Recommended)

Use the launcher script to start both server and frontend at once:

**Windows:**

```bash
start-game.bat
```

**Mac/Linux:**

```bash
chmod +x start-game.sh
./start-game.sh
```

**Or using npm/pnpm:**

```bash
pnpm start
# or
pnpm run dev:full
```

The script will:

- ✅ Check for `server/.env.local` (and warn if missing)
- ✅ Install dependencies if needed
- ✅ Start backend on `http://localhost:3001`
- ✅ Start frontend on `http://localhost:5173`
- ✅ Display colored logs for both processes

### Manual Start (Alternative)

If you prefer to run them separately:

**Terminal 1: Backend Server**

```bash
cd server
pnpm run dev
```

**Terminal 2: Frontend**

```bash
pnpm run dev
```

## Testing the Integration

1. Start the game
2. Find the radio in the Stairwell (StairSix)
3. `PUSH RADIO` or `PUSH CALL BUTTON`
4. Kevin will respond with his intro message
5. Try asking him questions:
   - `ASK KEVIN ABOUT REACTOR`
   - `ASK KEVIN ABOUT POWER`
   - `ASK KEVIN ABOUT DARK`
   - `ASK KEVIN ABOUT BUG`
   - `TELL KEVIN ABOUT ANYTHING`

Claude will generate responses based on Kevin's character profile!

## How It Works

### Character Profile

Kevin's character is defined in `src/game/actions/push/tryPushItem.ts`:

```typescript
characterProfile: {
  name: "Kevin",
  personality: "Urgent, helpful but dying, informal...",
  background: "Kevin is a facility worker who woke up...",
  knowledge: [
    "The facility has multiple levels",
    "There's a reactor that's unstable...",
    // ... things Kevin knows
  ],
  ignorance: [
    "What exactly caused the catastrophe",
    "Specific solutions to puzzles",
    // ... things Kevin doesn't know
  ],
  physicalState: "Trapped under heavy crates, dying...",
  objectives: [
    "Help the player restore power",
    // ... Kevin's goals
  ],
  timeContext: "Dying, only has 9 turns of conversation..."
}
```

### Conversation Flow

1. **Player Input:** `ASK KEVIN ABOUT REACTOR`
2. **Frontend:** Calls `askRadioVoice()` which is now async
3. **Backend API:** `/api/conversation/ask` receives:
   - Character profile
   - Conversation history
   - Player's question
4. **Claude API:** Generates contextual response
5. **Response Cache:** Stores response to avoid re-asking
6. **Game:** Displays `*pop* [Claude's response] *pop*`

### Fallback System

If Claude API fails (network issues, rate limits, etc.):

- The system automatically falls back to static dialog from `npcDialog.ts`
- Player experience continues uninterrupted
- Errors are logged to console

## Cost Considerations

- **Model:** Claude 3.5 Haiku (fastest & cheapest)
- **Cost:** ~$0.25-$3 per 1M tokens
- **Typical conversation:** 2-3k tokens = $0.001-0.01
- **9-turn conversation with Kevin:** ~$0.02-0.05

The backend caches responses, so asking Kevin the same question twice doesn't cost extra.

## Troubleshooting

### Server won't start - "API key not found"

Make sure `server/.env.local` exists and contains your API key.

### Claude responses aren't showing up

1. Check backend is running on port 3001
2. Check browser console for errors
3. Check backend console for API errors
4. Verify API key is valid at https://console.anthropic.com/

### Getting fallback responses instead of Claude

- Check backend logs for error messages
- Claude API might be rate-limited
- Network connectivity issues
- API key might be invalid or out of credit

## Adding New AI-Powered NPCs

To make another NPC use Claude AI:

1. **Define character profile:**

```typescript
{
  id: "npc_id",
  name: "NPC Name",
  aiEnabled: true,
  characterProfile: {
    name: "NPC Name",
    personality: "...",
    background: "...",
    knowledge: [...],
    ignorance: [...],
    physicalState: "...",
    objectives: [...],
    timeContext: "..."
  }
}
```

2. **Use in conversation:**

The existing `askRadioVoice` / `tellRadioVoice` functions will automatically use Claude if `aiEnabled: true`.

## Architecture

```
Frontend (React)
  ↓
src/game/services/claudeClient.ts
  ↓ HTTP POST
server/src/routes/conversation.ts
  ↓
server/src/services/claudeService.ts
  ↓ Anthropic SDK
Claude API
```

## Security

✅ API key stored server-side only  
✅ CORS configured for your domain  
✅ Rate limiting (1 req/second per voice)  
✅ Input validation  
✅ Response caching

## Production Deployment

See `server/README.md` for deployment options (Vercel, Fly.io, etc.).

## Support

For issues or questions about the Claude integration, check:

- Console logs (browser & server)
- Anthropic API status: https://status.anthropic.com/
- This repository's issues
