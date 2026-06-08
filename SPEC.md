# Dave Z's Asteroids on Steroids — Master Spec

The single source of truth for what this game is and how it's built. Pairs with
[CHANGELOG.md](CHANGELOG.md) (history) and [README.md](README.md) (quick start).

---

## 1. Overview

A single-file HTML5 Canvas remake of Atari's *Asteroids*, extended with
selectable physics modes, per-configuration leaderboards (local + a shared
cloud board), authentic synthesized arcade sound, and a full start menu. Runs in
any modern browser with no build step. Hosted on GitHub Pages, with an optional
Cloudflare D1 backend for global high scores.

- **Live (key-gated):** https://chateaufuente.github.io/asteroids-arcade/?key=arcade-3f9k2x7q
- **Repo:** https://github.com/ChateauFuente/asteroids-arcade

---

## 2. How to run

- **Locally:** open `index.html` in a browser. No key required on `file://`.
- **Hosted:** the URL must include `?key=<ACCESS_KEY>` or the page shows a
  "private" notice. A `noindex` meta + `robots.txt` keep it out of search engines.

---

## 3. Controls

| Input | Action |
|---|---|
| ← / → | Rotate |
| ↑ | Thrust |
| Space | Fire |
| H | Hyperspace (teleport; ~12% chance it misfires and kills you) |
| P / Esc | Pause / resume |
| M | Mute / unmute |
| Enter | Start (menu) / play again (game over) |
| Touch | On-screen pad auto-appears on touch devices; tap canvas to start |

---

## 4. Core mechanics

- **Ship:** rotation 0.06 rad/frame, thrust accel 0.12, velocity friction 0.99,
  bullet speed 7 (+ ship velocity), fire cooldown 10 frames, ~1.5 s spawn shield.
- **Asteroids:** sizes 3 (big) / 2 / 1; radius = size × 14. Shot asteroids split
  into two of the next size down; size-1 vanish. Speed scales with level and the
  Asteroid Speed setting.
- **Flying saucer:** appears on a timer (frequency scales with level + setting).
  Big = random shots, worth 200; small = aims at the ship, worth 1000. Its bullets
  (red) and body are lethal. **It explodes if it hits an asteroid** (in every mode).
- **Scoring:** asteroid = (4 − size) × 20 → 20/40/60. Saucer = 200 / 1000.
  **Bonus life every 10,000 points.**
- **Lives/levels:** starting lives = setting (default 3). On death the ship
  pauses ~1 s (RESPAWN_DELAY 60 frames) before reappearing with a spawn shield.
  Wave cleared → ~2 s breather (WAVE_DELAY 120 frames) → next level with
  `3 + level` asteroids. Screen wraps on all edges.

---

## 5. Physics modes (independent toggles → 8 configurations)

Three checkboxes on the menu combine freely. Config code = 3 bits
`collisions wormholes blackhole` ("000".."111"):

| Code | Label |
|---|---|
| 000 | ORIGINAL |
| 100 | COLLISIONS |
| 010 | WORMHOLES |
| 001 | BLACK HOLE |
| 110 | COLLISIONS + WORMHOLES |
| 101 | COLLISIONS + BLACK HOLE |
| 011 | WORMHOLES + BLACK HOLE |
| 111 | ALL THREE |

- **Collisions:** elastic asteroid-on-asteroid bouncing; mass ∝ size.
- **Wormholes:** two portals per wave; rocks, bullets, the saucer, and the ship
  teleport between them. The ship gets a brief shield on exit so it survives.
- **Black hole:** one hole per wave, placed away from center. Inverse-square
  gravity reaches the whole screen: `force = G / (dist² + 500)`. Anything crossing
  the event horizon (radius 20) is consumed. Strength `G` is a menu slider,
  0 (off) → 2600 (max), default 800.

---

## 6. Leaderboards

- **Per configuration:** each of the 8 configs keeps its own top-5 (initials + score).
- **Carousel:** the menu/game-over board shows one config at a time, auto-advances
  every 3 s, with ◀ ▶ arrows for manual control. Game over jumps to the config you
  just played.
- **Storage:** local `localStorage` (`asteroidsScoresV2`) by default. If the
  shared API is set and reachable, boards sync from / post to Cloudflare D1; on any
  failure (incl. local `file://`, blocked by CORS) it silently uses local scores.

---

## 7. Audio

Synthesized live via Web Audio (no audio files). Three-bus mixer:
`effects → fxGain`, `heartbeat → heartGain`, both → `masterGain` (mute). Effects
and heartbeat have independent volume sliders.

- **Heartbeat:** two-tone bass that accelerates as a wave clears (the iconic sound).
- **Thrust:** looped low-pass noise rumble. **Fire:** descending "pew."
- **Saucer:** continuous warbling siren (low = big, high = small).
- **Explosions:** filtered noise bursts. **Bonus life:** 3-note jingle.

---

## 8. Menu & settings

Difficulty presets (Easy / Normal / Hard) plus custom sliders: Asteroid Speed,
Starting Asteroids, Saucer Frequency, Starting Lives. Physics checkboxes + Black
Hole Gravity slider (greyed out unless Black Hole is on). Heartbeat + Effects
volume sliders.

---

## 9. Security / access

- **Access key:** `ACCESS_KEY` constant gates the hosted page (client-side
  obscurity — stops guessing & indexing, not a hard secret).
- **API key:** the Worker requires the same key (`ARCADE_KEY` secret) and is
  CORS-locked to the Pages origin.
- **Known limitation:** key is readable in page source, so the shared board is
  spoofable by a determined user. Fine for friendly play; hardenable later
  (server-side validation / signed submissions).

---

## 10. Architecture & files

```
index.html      Entire game (HTML + CSS + JS). Served by GitHub Pages at root.
robots.txt      Disallow all crawlers.
SPEC.md         This document.
CHANGELOG.md    Version history.
README.md       Quick start.
api/            Cloudflare backend (deployed separately from the page):
  wrangler.toml   Worker config + D1 binding (binding DB → arcade_leaderboard).
  schema.sql      scores(id, config, initials, score, created_at) + index.
  src/index.js    Worker API: GET /scores[?config=], POST /scores; CORS; key gate.
  README.md       Backend deploy guide.
```

**Hosting:** front-end = GitHub Pages (`ChateauFuente/asteroids-arcade`).
Backend = Cloudflare Worker `arcade-api`
(https://arcade-api.dave-zoellner-us.workers.dev) + D1 `arcade_leaderboard`,
in account dave.zoellner.us@gmail.com. Fully isolated from other projects.

---

## 11. Update procedures

- **Game change:** edit `index.html` → `git add -A && git commit && git push`.
  GitHub Pages redeploys automatically (~1 min).
- **API change:** edit `api/**` → `cd api && npx wrangler@latest deploy`.
- **Inspect scores:** `cd api && npx wrangler@latest d1 execute arcade_leaderboard
  --command "SELECT * FROM scores ORDER BY score DESC;" --remote`.
- **Change the key:** update `ACCESS_KEY` in `index.html` AND the Worker secret
  (`npx wrangler@latest secret put ARCADE_KEY`); keep them identical.

Local toolchain (self-contained under `~/.local`, no Homebrew): `gh`, Node LTS,
`wrangler` (via npx). Both `gh` and Cloudflare logins persist until logout.

---

## 12. Possible next steps

Power-ups, more enemy types, additional games in the arcade, score
tamper-resistance, custom domain, retro vector-glow rendering.
