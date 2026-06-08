# Shared Leaderboard API (Cloudflare Worker + D1)

This folder holds an **optional** backend that turns the per-browser
leaderboards into one global board shared across every player and device.

It is **not deployed yet** — these are ready-to-run templates. The game works
fine without it. Everything here uses **new, uniquely-named** Cloudflare
resources so it stays fully isolated from any other projects in your account.

## What gets created (all new, all isolated)

| Resource     | Name                 | Notes                                  |
|--------------|----------------------|----------------------------------------|
| D1 database  | `arcade_leaderboard` | Stores all scores.                     |
| Worker (API) | `arcade-api`         | Reads/writes the database over HTTPS.   |
| Secret       | `ARCADE_KEY`         | Shared key gating the API.              |

## Deploy steps (when you're ready)

> Requires Node.js. We'll install `wrangler` (Cloudflare's CLI) locally, the
> same isolated way we installed `gh`.

```bash
cd api

# 1. Log in to Cloudflare (opens a browser, like the GitHub device login)
npx wrangler login

# 2. Create the database (prints a database_id)
npx wrangler d1 create arcade_leaderboard
#    -> paste the printed id into wrangler.toml (database_id = "...")

# 3. Create the table
npx wrangler d1 execute arcade_leaderboard --file=schema.sql --remote

# 4. Set the shared key (use the SAME value as the game's ACCESS_KEY)
npx wrangler secret put ARCADE_KEY

# 5. Set ALLOW_ORIGIN in wrangler.toml to your GitHub Pages origin
#    e.g. https://chateaufuente.github.io

# 6. Deploy
npx wrangler deploy
#    -> prints your API URL, e.g. https://arcade-api.<subdomain>.workers.dev
```

Then flip the game to shared mode by setting that API URL near the top of
`../index.html` (a single `LEADERBOARD_API` constant — added when we wire it up).
If the API is ever unreachable, the game automatically falls back to local
per-browser scores.
