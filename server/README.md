# AYSF Game Server

Backend API server for Claude AI-powered NPC conversations.

## Quick Start

```bash
# Install dependencies
pnpm install

# Create environment file
copy .env.local.example .env.local
# Edit .env.local and add your Anthropic API key

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start
```

## Environment Variables

Required in `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
PORT=3001
NODE_ENV=development
```

## API Endpoints

### `POST /api/conversation/ask`

Generate AI response for NPC conversation.

**Request:**

```json
{
  "npcId": "kevin_1st_contact",
  "characterProfile": {
    "name": "Kevin",
    "personality": "...",
    "background": "...",
    "knowledge": [...],
    "ignorance": [...],
    "physicalState": "...",
    "objectives": [...],
    "timeContext": "...",
    "conversationContext": "..."
  },
  "conversationHistory": [
    {
      "turn": 1,
      "type": "ask",
      "topic": "reactor",
      "response": "..."
    }
  ],
  "playerInput": {
    "type": "ask",
    "topic": "power"
  }
}
```

**Response:**

```json
{
  "success": true,
  "response": "Yeah man (cough)...you gotta get the power on first...",
  "cached": false
}
```

### `GET /api/conversation/health`

Health check for conversation service.

### `GET /api/health`

Server health check.

## Features

- ✅ **Caching**: Responses cached to avoid duplicate API calls
- ✅ **Rate Limiting**: 1 request per second per voice
- ✅ **Error Handling**: Graceful fallback on API failures
- ✅ **CORS**: Configured for frontend access
- ✅ **Logging**: Request/response logging for debugging

## Development

The server uses:

- **Express** for HTTP server
- **Anthropic SDK** for Claude API
- **tsx** for TypeScript execution
- **CORS** for cross-origin requests

## Production Deployment

### Option 1: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
fly deploy
```

### Option 2: Vercel

Install Vercel CLI and deploy:

```bash
vercel
```

### Option 3: Railway

Connect your GitHub repo to Railway and it will auto-deploy.

### Environment Variables in Production

Don't forget to set these in your deployment platform:

- `ANTHROPIC_API_KEY`
- `NODE_ENV=production`
- `FRONTEND_URL` (your frontend domain)
- `PORT` (usually set automatically)

## Monitoring

Check server logs for:

- API call success/failure
- Cache hits/misses
- Rate limit triggers
- Error messages

## Security Considerations

✅ API key is server-side only (never exposed to frontend)  
✅ CORS configured to specific origin in production  
✅ Rate limiting prevents abuse  
✅ Input validation on all endpoints  
✅ No sensitive data in logs

## Cost Optimization

- Responses are cached (same question = no API call)
- Using Claude 3.5 Haiku (cheapest model)
- Max tokens limited to 200 per response
- Rate limiting prevents runaway costs

Typical costs: **$0.02-0.05 per full 9-turn conversation with Kevin**

## Troubleshooting

**"API key not found"**

- Check `.env.local` exists in server directory
- Verify `ANTHROPIC_API_KEY` is set

**"Failed to reach Claude service"**

- Check Anthropic API status
- Verify API key is valid
- Check for rate limits on your account

**CORS errors**

- Update `FRONTEND_URL` in production
- Check origin in CORS configuration

## License

MIT
