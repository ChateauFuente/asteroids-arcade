# Stunt Cycle — Master Spec

Master spec for the Stunt Cycle game in Dave Z's Arcade. Pairs with the arcade's
unified [CHANGELOG.md](../CHANGELOG.md). Sister game: [Asteroids](../asteroids/SPEC.md).

---

## 1. Overview

A wireframe homage to Atari's 1976 *Stunt Cycle*: a motorcycle revs up, launches
off a ramp, and tries to clear a row of buses and reach the landing ramp. Single
self-contained HTML file (`stunt-cycle/index.html`), Canvas + vanilla JS, no build
step. Same black / teal-cyan / monospace look as the rest of the arcade.

- **Live (key-gated):** https://chateaufuente.github.io/asteroids-arcade/stunt-cycle/index.html?key=arcade-3f9k2x7q
- Reached from the arcade menu, which passes the key through automatically.

---

## 2. Faithful to the original

Per the 1976 design (Wikipedia / Atari manual): the player has **throttle only —
accelerate/brake, no steering, and no control in the air.** The whole skill is
the launch speed. Two failure modes: **too slow** (don't reach the landing ramp →
into the buses) and **too fast** (overshoot / "fly off the end of the screen").
Each successful jump **adds a bus**. We mirror all of this; we do *not* add any
invented in-air controls.

---

## 3. Goal & loop

Clear all the buses and touch down on the landing ramp beyond them. Each success
adds the cleared buses to your score **and adds one more bus**. Crash and you lose
one of 3 lives. Game over at 0 lives; best score kept locally (`localStorage`
key `stuntCycleHigh`).

---

## 4. Controls

| Input | Action |
|---|---|
| ↑ or Space (hold) | Rev — fills the THROTTLE meter |
| release ↑ / tap Space | Launch off the ramp at that speed |
| P / Esc | Pause / resume |
| M | Mute / unmute |
| Enter | Start / play again |
| Touch | A single HOLD-TO-REV button; tap the canvas to start |

There is **no in-air control** — true to the original.

---

## 5. The skill — a speed window

Launch speed (set by how far you fill the throttle) decides where you land:

- **Too little** → you drop into the buses (crash).
- **Just right** → you touch down anywhere on the **landing ramp** (the whole
  ramp is safe — forgiving, not a single point).
- **Too much** → you sail past the ramp and crash off the end.

As buses are added the safe-speed band shifts higher, so later jumps need a fuller
throttle. The throttle fills slowly so the band is easy to hit.

---

## 6. Mechanics & tuning (named constants)

- **Phases:** `rev` (fill throttle; bike does a small wheelie for show) → `run`
  (rolls up the ramp at launch speed) → `air` (projectile; nose follows the arc).
  A ~1 s freeze shows CLEARED! / CRASH! then resets.
- **Throttle:** fills at `POWER_RATE = 0.7`/frame (slow, for control); launch
  speed `MIN_S(4) + power% · (MAX_S(15) − MIN_S)`.
- **Physics:** gravity `G = 0.34`/frame; launch angle = takeoff-ramp angle
  `atan2(55, 90)`.
- **Geometry (800×600):** ground `y=470`; takeoff ramp `x 150→240` rising 55px;
  buses 26 wide × 34 tall starting at `x=262`; landing ramp 120px long, dropping
  55px back to the ground; flat ground beyond. Up to ~13 buses fit on screen.
- **Outcomes:** bus contact or falling short = crash; touchdown in
  `(busEnd, landEnd]` = cleared; touchdown past `landEnd` = overshoot crash.

Tuning knobs you'll likely touch: `POWER_RATE` (rev speed), `MIN_S`/`MAX_S`
(speed range), `LAND_LEN` (landing-window width), starting `numBuses`.

---

## 7. Look

Wireframe throughout. Buses are drawn with **rounded corners**, a window strip
with a divider, and two wheels, so they read as buses rather than plain boxes.
The bike is two wheels + frame with a cyan rider.

---

## 8. Audio

Synthesized (no files), through a master/mute gain: an **engine** sawtooth whose
pitch rises with the throttle, a **jump** tone+pop, a **crash** noise+thud, and a
two-note **clear** chime.

---

## 9. Architecture

```
stunt-cycle/index.html   Whole game (gate + canvas + JS). Served by GitHub Pages.
stunt-cycle/SPEC.md      This document.
```

State machine `menu → playing (rev/run/air/done) → over`, plus `paused`. Access-key
gate identical to the other arcade pages (enforced only when hosted). No backend
yet — scores are local; a shared leaderboard (via the arcade `api/` Worker, adding
a `game` dimension) is a possible future step.

---

## 10. Possible next steps

Shared leaderboard, a "race" mode (the original's other half), a tachometer dial,
varied bus liveries, skid/landing-roll animation.
