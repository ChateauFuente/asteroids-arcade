# Stunt Cycle — Master Spec

Master spec for the Stunt Cycle game in Dave Z's Arcade. Pairs with the arcade's
unified [CHANGELOG.md](../CHANGELOG.md). Sister game: [Asteroids](../asteroids/SPEC.md).

---

## 1. Overview

A wireframe homage to Atari's 1977 *Stunt Cycle*: a motorcycle revs up, launches
off a ramp, and tries to clear a row of buses and land cleanly on the far ramp.
Single self-contained HTML file (`stunt-cycle/index.html`), Canvas + vanilla JS,
no build step. Same black / teal-cyan / monospace look as the rest of the arcade.

- **Live (key-gated):** https://chateaufuente.github.io/asteroids-arcade/stunt-cycle/index.html?key=arcade-3f9k2x7q
- Reached from the arcade menu, which passes the key through automatically.

---

## 2. Goal & loop

Clear all the buses and land safely on the down-ramp beyond them. Each success
adds the cleared buses to your score **and adds one more bus** for the next jump.
Crash and you lose one of 3 lives. Game over at 0 lives; best score is kept
locally (`localStorage` key `stuntCycleHigh`).

---

## 3. Controls

| Input | Action |
|---|---|
| ↑ or Space (hold) | Rev — fills the POWER meter |
| release ↑ / tap Space | Launch off the ramp at that power |
| ← / → | Rotate the bike in mid-air (level it to land) |
| P / Esc | Pause / resume |
| M | Mute / unmute |
| Enter | Start / play again |
| Touch | On-screen REV (hold) + ◀ ▶ buttons on touch devices; tap to start |

---

## 4. The skill

Two things to get right per jump:

1. **Power** → launch speed (6–15). Too little and you drop into the buses; more
   power flies farther. Range grows as buses are added, so later jumps need a
   near-full meter.
2. **Landing angle** → the bike launches nose-up (matching the ramp). You must
   rotate it back toward level so it touches down within **±0.45 rad** (~26°),
   or it tumbles. This is the per-jump challenge.

---

## 5. Mechanics & tuning

- **Phases:** `rev` (build power) → `run` (auto roll-up the ramp at launch speed)
  → `air` (projectile). On landing/crash a ~1 s freeze shows CLEARED! / CRASH!
  then the bike resets.
- **Physics:** gravity `G = 0.35`/frame; launch angle = takeoff-ramp angle
  `atan2(60, 110)`; power fills at 1.5/frame to 100; launch speed `6 + power%·9`.
- **Geometry (side view, 800×600):** ground `y=470`; takeoff ramp `x 250→360`
  rising 60px to the lip; buses 46×46 starting at `x=384`; landing down-ramp
  starts 14px past the last bus, 130px long, dropping back to ground.
- **Outcomes:** touching a bus, falling short, or landing too steep = crash;
  touching down past the buses within the angle tolerance = cleared.

---

## 6. Audio

Synthesized (no files), routed through a master/mute gain:
- **Engine:** a sawtooth whose pitch rises with the power meter while revving.
- **Jump:** a short descending tone + noise pop.
- **Crash:** low noise burst + thud. **Clear:** two-note up-chime.

---

## 7. Architecture

```
stunt-cycle/index.html   Whole game (gate + canvas + JS). Served by GitHub Pages.
stunt-cycle/SPEC.md      This document.
```

State machine `menu → playing (rev/run/air) → over`, plus `paused`. Access-key
gate identical to the other arcade pages (enforced only when hosted). No backend
yet — scores are local; a shared leaderboard (via the arcade `api/` Worker, adding
a `game` dimension) is a possible future step.

---

## 8. Possible next steps

Shared leaderboard, a second mode (timed obstacle race like the original's other
half), tilt/wheelie landing bonus, varied ramps, engine/skid polish.
