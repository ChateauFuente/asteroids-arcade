# Changelog — Dave Z's Arcade

Unified history for the whole arcade (the menu and every game). Newest first.
Built iteratively in a single development channel; dates reflect that work
(2026-06-08). Per-game design details live in each game's `SPEC.md`.

## [Unreleased]
### Arcade
- **Restructured into a multi-game arcade.** Root `index.html` is now a games
  menu; Asteroids moved to `asteroids/`, and a new **Stunt Cycle** game added in
  `stunt-cycle/`. The menu gates with the access key and passes it to each game.
- Per-game master specs (`asteroids/SPEC.md`, `stunt-cycle/SPEC.md`); this
  changelog unified for the whole arcade.

### Arcade / backend
- **Shared leaderboard now spans multiple games.** Added a `game` column to the
  D1 table and a `game` param to the Worker API (defaults to `asteroids`), so each
  game keeps its own boards. Asteroids unaffected.

### Stunt Cycle (new)
- **Fit-to-screen scaling.** When the buses + landing ramp would run off the right
  edge (~15+ buses), the scene now zooms out (anchored at the ground) so the whole
  landing zone stays visible. Physics is unchanged — only the drawing scales.
- **Shared top-5 leaderboard with initials.** Beating the top 5 prompts for
  initials and posts to the global board (game `stunt-cycle`); the board shows on
  the menu and game-over screens, with a local fallback.
- Wireframe Atari-style bus jump: rev a throttle meter, launch off the ramp, clear
  the buses, and land on the ramp. Each clear adds a bus; 3 lives; local high
  score; synthesized engine/jump/crash/clear sound; touch controls.
- **Reworked the landing/throttle** after review: removed the original fussy
  single-point landing; forgiving **speed window** (too slow = into the buses,
  too fast = overshoot) and redrew buses with rounded bodies, windows, and wheels.
- **Two-lane run-up + tube + tire landing.** Added a top run-up lane (drive
  right→left, adjust speed the whole way) that tubes down to the jump lane, like
  the original's platform/tube layout. In the air ← → rotate the bike; you must
  land **rear-wheel-first** on the ramp (front-first = crash), with a rear lean up
  to ~60% of vertical relative to the ramp counting as good.
- **Solid ramps with vertical front faces + corrected landing zone.** Both ramps
  now draw a vertical front face. Coming in below the landing ramp's top edge
  smacks the face (crash) instead of counting as a landing; only the sloped top is
  valid. Re-tuned ramp geometry (verified by simulation) so a real speed window
  exists at every bus count.

### Asteroids
- Hyperspace moved from **H** to the **Down arrow** (keeps the hand on the
  arrows + space).
- Arcade-style pauses: ~1 s delay before a destroyed ship respawns, and ~2 s
  breather between waves (both were instantaneous before).
- Title rebranded on the menu to **DAVE Z'S / ASTEROIDS / ON STEROIDS** (teal
  accents above and below the white "ASTEROIDS"); browser tab title updated.
- Added a master spec.

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
