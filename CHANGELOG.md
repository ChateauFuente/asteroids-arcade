# Changelog

All notable changes to *Dave Z's Asteroids on Steroids*. Newest first.
This project was built iteratively in a single development channel; dates reflect
that work (2026-06-08).

## [Unreleased]
- Arcade-style pauses: ~1 s delay before a destroyed ship respawns, and ~2 s
  breather between waves (both were instantaneous before).
- Title rebranded on the menu to **DAVE Z'S / ASTEROIDS / ON STEROIDS** (teal
  accents above and below the white "ASTEROIDS"); browser tab title updated.
- Added master spec (`SPEC.md`) and this changelog.

## [0.8] — Shared cloud leaderboard (Cloudflare D1)
- Deployed `arcade-api` Worker backed by D1 database `arcade_leaderboard`.
- API: `GET /scores[?config=]`, `POST /scores`; CORS-locked to the Pages origin;
  gated by an `ARCADE_KEY` secret matching the game's access key.
- Game now syncs and posts per-config boards to the cloud, with automatic
  fallback to per-browser scores when the API is unreachable.

## [0.7] — Online & isolated
- Published to GitHub Pages as a new, isolated public repo `asteroids-arcade`.
- Added access-key gate (`?key=...`) + `noindex` meta + `robots.txt`.
- Scaffolded the `api/` Cloudflare Worker/D1 backend (deployed later in 0.8).
- Renamed entry file to `index.html`; installed `gh`/Node/`wrangler` locally.

## [0.6] — Per-configuration leaderboards
- Split the single leaderboard into 8 boards, one per physics configuration.
- Added an auto-rotating (3 s) carousel with ◀ ▶ arrows to browse them.

## [0.5] — Initials & top-5 board
- Beating the top 5 prompts for 3-letter initials.
- Top-5 leaderboard shown on the menu and game-over screens (was per-browser).

## [0.4] — Custom physics & gravity tuning
- Replaced single-select physics modes with independent **checkboxes**
  (mix-and-match): Asteroid Collisions, Wormholes, Black Hole.
- Added a Black Hole Gravity strength slider (0 = off … 2600 = max, default 800).
- Start menu with difficulty presets + custom sliders and separate
  heartbeat/effects volume sliders.

## [0.3] — More physics & polish
- **Black hole** mode: whole-screen inverse-square gravity; objects crossing the
  event horizon are consumed.
- Saucers now explode on contact with asteroids (all modes).
- Added a Collisions + Wormholes hybrid; saucer travels through wormholes.
- Pause menu (P/Esc); ship survives wormhole trips via a brief exit shield.

## [0.2] — Physics modes & feel
- Asteroid-on-asteroid elastic collisions.
- Wormhole portals that teleport rocks, bullets, the saucer, and the ship.

## [0.1] — Feature build-out
- Authentic synthesized arcade sound (heartbeat, thrust, fire, saucer siren,
  explosions) via a Web Audio mixer.
- Explosion particles, flying saucer enemy, bonus life every 10,000, hyperspace,
  touch controls, mute.

## [0.0] — Initial game
- Single-file HTML5 Canvas Asteroids: ship movement with inertia, screen wrap,
  shooting, splitting asteroids, lives, levels, score, start/game-over screens.
