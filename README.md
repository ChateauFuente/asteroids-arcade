# Asteroids Arcade

A self-contained browser version of the classic Asteroids, written in a single
HTML file. Built as a sandbox / learning project, with room to grow into a
small public web app.

## Play it

Open `index.html` in any modern browser — no install, no build step.

When hosted online it requires an access key in the URL
(`?key=...`) so the link can't be guessed, and a `noindex` tag keeps it out of
search engines. Opening the file locally skips the key.

## Layout

```
index.html      The whole game (canvas + JavaScript). Served by GitHub Pages.
robots.txt      Tells search engines not to index the hosted page.
api/            Cloudflare Worker + D1 schema for an OPTIONAL shared
                leaderboard. Stored here, ready to deploy — not required to play.
```

## Features

- Vector-style ship, asteroids, flying saucer, explosions, authentic arcade sound
- Start menu with difficulty presets + custom sliders
- Mix-and-match physics toggles: asteroid collisions, wormholes, black hole
- A separate top-5 leaderboard for each of the 8 physics combinations
- Pause, hyperspace, touch controls

## Shared leaderboard (later)

By default each browser keeps its own high scores (via `localStorage`). To make
one global leaderboard shared across everyone, deploy the Cloudflare Worker in
`api/` — see [`api/README.md`](api/README.md). The game is structured so this is
a small, isolated change.
