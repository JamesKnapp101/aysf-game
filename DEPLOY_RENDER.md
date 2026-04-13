# Deploying AYSF On Render

This repo can be deployed as a single Node web service:

- the React/Vite frontend is built to `dist/`
- the Express server in `server/` serves that build in production
- AI NPC requests go to the same origin at `/api/conversation/*`

## What You Need

- A Render account connected to this GitHub repo
- An Anthropic API key
- Access to DNS for your domain, if you want a custom URL

## Recommended URL

Use a subdomain first, for example:

- `aysf.james-knapp.com`
- `play.james-knapp.com`

That lets you test without disturbing your existing `www.james-knapp.com` site.

## Deploy With `render.yaml`

This repo includes a Render blueprint in [render.yaml](/abs/path/c:/dev/aysf-game/render.yaml).

In Render:

1. Create a new Blueprint or Web Service from the GitHub repo.
2. Choose the web service plan you want.
3. Confirm the build command and start command from `render.yaml`.
4. Set `ANTHROPIC_API_KEY` in the service environment variables.
5. Deploy.

## What Render Runs

Build command:

```bash
corepack enable && pnpm install --frozen-lockfile && cd server && pnpm install --frozen-lockfile && pnpm run build && cd .. && pnpm run build
```

Start command:

```bash
cd server && pnpm start
```

## Health Check

After deploy, verify:

- `https://your-service.onrender.com/api/health`

You should get a JSON health response.

## Custom Domain

Once the Render URL works:

1. Add a custom domain in Render, such as `aysf.james-knapp.com`.
2. In GoDaddy DNS, add the DNS record Render tells you to add.
3. Wait for DNS to propagate.
4. Re-test both the homepage and `/api/health` on the custom domain.

## Environment Variables

Required:

- `ANTHROPIC_API_KEY`

Optional:

- `PORT` if you want to override Render's default injected port

## Before Local Production Testing

Set an Anthropic key in `server/.env.local` or in your shell environment before running:

```bash
pnpm run start:prod
```

## Notes

- Saves stay in the player's browser via `localStorage`.
- The server response cache is in memory and resets on deploy/restart.
- If the AI service fails, the frontend still falls back to authored dialog.

## Local Verification Before Deploy

From the repo root:

```bash
pnpm run build:prod
pnpm run start:prod
```

Then open:

- `http://localhost:3001`
- `http://localhost:3001/api/health`
