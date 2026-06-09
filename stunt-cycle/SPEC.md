# Stunt Cycle — Master Spec

Master spec for the Stunt Cycle game in Dave Z's Arcade. Pairs with the arcade's
unified [CHANGELOG.md](../CHANGELOG.md). Sister game: [Asteroids](../asteroids/SPEC.md).

---

## 1. Overview

A wireframe bus-jump inspired by Atari's 1976 *Stunt Cycle*, which used multiple
platforms connected by tubes. Single self-contained HTML file
(`stunt-cycle/index.html`), Canvas + vanilla JS, no build step. Black /
teal-cyan / monospace, matching the arcade.

- **Live (key-gated):** https://chateaufuente.github.io/asteroids-arcade/stunt-cycle/index.html?key=arcade-3f9k2x7q
- Reached from the arcade menu, which passes the key through automatically.

---

## 2. The run: three lanes + two tubes

Matching the original's three-platform layout — two stacked run-up lanes feed the
jump lane, zig-zagging via tubes:

1. **Lane A (top run-up)** — enters at the left, drives **left → right**, building
   throttle (**↑ faster, ↓ slower**). Tubes down on the **right**.
2. **Lane B (middle run-up)** — drives **right → left**, *still building throttle*.
   Tubes down on the **left**.
3. **Ramp (jump) lane** — rides **left → right**, up the takeoff ramp, and launches.

Two run-up lanes ≈ 1360px of acceleration, so the throttle can build to ~22.5
(cap is **MAX_S = 30**, doubled from 15 with the same fill rate — the extra lane
provides the extra run-up time). Simulated ceiling: **~50 buses** (the run-up
distance, not the cap, is the limit; a 3rd run-up lane would reach ~75). The
fit-to-screen zoom stays readable through that (vs ≈ 0.47 at ~48 buses).

---

## 3. Goal & loop

Clear all the buses and land cleanly on the ramp. Each success adds the cleared
buses to your score **and adds one more bus**. Crash and you lose one of 3 lives.
Game over at 0 lives; best score kept locally (`localStorage` key `stuntCycleHigh`).

---

## 4. Controls

| Input | Action |
|---|---|
| ↑ / ↓ (top lane) | Faster / slower — set launch speed |
| ← / → (in air) | Rotate the bike (set landing angle) |
| P / Esc | Pause / resume |
| M | Mute / unmute |
| Enter | Start / play again |
| Touch | ↑ ↓ ↺ ↻ buttons; tap to start |

---

## 5. The two skills

1. **Speed (top lane):** too slow and you drop into the buses; too fast and you
   overshoot past the landing ramp. The whole ramp length is a valid touchdown
   zone, so it's a forgiving speed *window*, not a point.
2. **Landing angle (in air):** you must come down **rear-wheel-first** on the
   ramp's **top slope** (or both wheels together matching the ramp). The ramp has
   a **vertical front face** — coming in below the top edge smacks that face and
   crashes. Only the sloped top, from the top edge down to the flat, is valid.
   Front-wheel-first = crash.
   - Measured relative to the ramp slope `PHI`: at touchdown `rel = angle − PHI`.
     Safe when `−LEANBACK ≤ rel ≤ FRONT_EPS`.
   - `LEANBACK = 60% of vertical` (~54°) of allowed rear-first lean; `FRONT_EPS`
     (~6°) lets a near-flat "both wheels" landing pass. Over-rotated past either
     bound = crash.
   The bike launches nose-up off the ramp, so you press → to bring it down toward
   the ramp angle before landing.

---

## 6. Mechanics & tuning (named constants)

- **Phases:** `approach` (top lane, set speed) → `tube` (drop down the left tube)
  → `run` (bottom lane to the ramp) → `air` (projectile + angle control) →
  `done` (~1 s CLEARED!/CRASH! freeze, then reset).
- **Speed:** `ACCEL 0.18` / `BRAKE 0.22` per frame, clamped `MIN_S 1.5 … MAX_S 30`;
  carried unchanged through the tube and jump.
- **Air:** rotate at `ROT 0.045`/frame; gravity `G 0.34`.
- **Landing rule:** `PHI = atan2(LAND_RISE, LAND_LEN)`, `LEANBACK = 0.6·π/2`,
  `FRONT_EPS = 0.10`. Lowest wheel = `y + |AX·sin(angle)| + WHEEL_R`.
- **Geometry (800×600):** ground `y=470`; top lane `y=150` (x 60→740); left tube
  at `x=60`; takeoff ramp `x 150→240` rising 55 with a vertical launch face;
  buses 26×34 from `x=262`; landing ramp `LAND_LEN=160` long with a vertical front
  face `LAND_RISE=35` tall (top edge ≈ bus-top height), then the sloped top, then
  flat. Speed windows (sim, with landing tilt): ~3.0 wide at 2 buses tapering to
  ~1.25 at 12.
- **Fit-to-screen:** physics runs in fixed world coordinates; only the drawing is
  scaled. Once `landEnd` would pass the right edge (~14+ buses) the scene is zoomed
  out (`vs = min(1, (W−12)/(landEnd+12))`, anchored at the ground line) so the
  whole landing zone stays visible. HUD/text are drawn unscaled.
- **Outcomes:** bus contact / fall short of the ramp / hitting the front face =
  crash; touchdown on the top slope with a safe angle = cleared; past the ramp
  end, or wrong angle = crash.

Likely tuning knobs: `ACCEL`/`BRAKE`, `LEANBACK`/`FRONT_EPS` (landing strictness),
`ROT`, `LAND_LEN` (window width), starting `numBuses`.

---

## 7. Look

Wireframe. Two lanes joined by a left tube; buses drawn with rounded bodies, a
window strip, and wheels; the bike is two wheels + frame with a cyan rider that
mirrors to face the direction of travel and rotates in the air.

---

## 8. Audio

Synthesized (no files), through a master/mute gain: an **engine** sawtooth whose
pitch tracks speed, a **jump** tone+pop, a **crash** noise+thud, a two-note
**clear** chime.

---

## 9. Architecture

```
stunt-cycle/index.html   Whole game (gate + canvas + JS). Served by GitHub Pages.
stunt-cycle/SPEC.md      This document.
```

State machine `menu → playing (approach/tube/run/air/done) → over`, plus `paused`.
Access-key gate identical to the other arcade pages (enforced only when hosted).

**Shared leaderboard:** uses the same Cloudflare D1 backend as Asteroids
(`arcade-api` Worker), namespaced by `game="stunt-cycle"`, `config="main"`. On
game over, beating the top 5 prompts for 3-letter initials and posts to the global
board; the top-5 (with initials) shows on the menu and game-over screens. Falls
back to per-browser scores (`localStorage` key `stuntCycleScores`) when the API is
unreachable.

---

## 10. Possible next steps

Shared leaderboard, a tachometer dial on the run-up, multiple stacked run-up lanes
like the full original, skid/landing-roll animation, varied bus liveries.
