# AYSF Game Server

Express backend for AI-enabled NPC conversations in AYSF. The server keeps the Anthropic API key off the client, formats character prompts, applies lightweight request protection, and exposes the conversation endpoints used by the frontend.

The frontend can still run without this service. If the API is unavailable, the game falls back to authored NPC dialog.

## Responsibilities

- Accept conversation requests from the frontend
- Build character-aware prompts from NPC profile data and conversation history
- Call the Anthropic Messages API
- Cache repeated prompts in memory
- Apply lightweight in-memory abuse protection
- Return fallback-friendly error payloads to the client

## Requirements

- Node.js 20+ recommended
- `pnpm`
- An Anthropic API key

## Setup

From the `server/` directory:

```bash
pnpm install
cp .env.example .env.local
```

Set your API key in `.env.local`:

```env
ANTHROPIC_API_KEY=replace-with-your-anthropic-api-key
PORT=3001
NODE_ENV=development
```

`FRONTEND_URL` is only needed in production, where CORS is restricted to that origin.

## Running the Server

From `server/`:

```bash
pnpm run dev
```

The API listens on `http://localhost:3001`.

From the repo root, you can also use:

```bash
pnpm run dev:server
pnpm run dev:full
```

## API

### `GET /api/health`

Basic server health check.

Example response:

```json
{
  "status": "ok",
  "service": "aysf-game-server",
  "timestamp": "2026-03-12T12:00:00.000Z"
}
```

### `GET /api/conversation/health`

Conversation service health check, including in-memory cache size.

Example response:

```json
{
  "status": "ok",
  "cacheSize": 3,
  "trackedClients": 2,
  "trackedNpcCooldowns": 2
}
```

### `POST /api/conversation/ask`

Generates an AI response for an NPC conversation turn.

Request body:

```json
{
  "npcId": "RangerBot",
  "characterProfile": {
    "name": "The ranger robot",
    "personality": "helpful and slightly rigid",
    "background": "park support robot",
    "knowledge": ["park hours", "restricted areas"],
    "ignorance": ["the full outbreak timeline"],
    "physicalState": "operational",
    "objectives": ["help the player without leaving role"],
    "timeContext": "events are unfolding in real time",
    "conversationContext": "The player is exploring a dangerous ship."
  },
  "conversationHistory": [
    {
      "turn": 12,
      "type": "ask",
      "topic": "hours",
      "response": "Park hours are currently suspended."
    }
  ],
  "playerInput": {
    "type": "ask",
    "topic": "reactor"
  }
}
```

Success response:

```json
{
  "success": true,
  "response": "I do not manage reactor systems, sir.",
  "cached": false
}
```

Failure responses include `fallback: true` so the frontend can switch to authored dialog.

### `POST /api/conversation/clear-cache`

Development endpoint that clears the in-memory response cache.

Example response:

```json
{
  "success": true,
  "message": "Cache cleared"
}
```

## Runtime Behavior

- Request bodies are limited to `1mb`
- Development CORS origin is `http://localhost:5173`
- Cache keys are based on `npcId`, input type, and normalized topic text
- Request logs include request id, method, path, status, duration, client IP, and a shortened user agent for page and API requests
- Conversation requests are rate-limited in memory per client with:
  - a burst limit of `6` requests per `10` seconds
  - a sustained limit of `20` requests per `60` seconds
  - a per-client per-NPC cooldown of `1500ms`
- Cached conversation responses are capped in memory to limit unbounded growth
- The configured Claude model and prompt strategy live in `src/services/claudeService.ts`

## Scripts

- `pnpm run dev` starts the server with `tsx watch`
- `pnpm run build` compiles TypeScript to `dist/`
- `pnpm start` runs the compiled server from `dist/index.js`

## Notes

- Cache and rate-limit state are stored in memory, so they reset on restart.
- `POST /api/conversation/clear-cache` is available only outside production.
- This service currently has no standalone test or lint script in `server/package.json`.
