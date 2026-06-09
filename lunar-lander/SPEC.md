# Lunar Lander — Master Spec

Master spec for the Lunar Lander game in Dave Z's Arcade. Pairs with the arcade's
unified [CHANGELOG.md](../CHANGELOG.md). Sister games:
[Asteroids](../asteroids/SPEC.md), [Stunt Cycle](../stunt-cycle/SPEC.md).
Follows the shared arcade template (pause/game-over/controls/style/leaderboard).

> Status: **design laid out, not yet built.** This document is the plan.

---

## 1. Source / authenticity

Based on Atari's **Lunar Lander (1979)** — a side-view, black-and-white **vector**
space-flight simulation (so wireframe fits our arcade). Authentic elements we
reproduce (sources at the end):

- Side view; rotate the module left/right and fire a **proportional thruster**;
  realistic **gravity + momentum**.
- **Fuel-limited**, not time-limited: thrust burns fuel; out of fuel = no control.
- Lunar surface of jagged terrain with flat **landing pads**, each flashing a
  **bonus multiplier that's higher for smaller/harder pads**.
- **Crash if** you touch down moving too fast, rotated too far from vertical, or
  on non-flat ground. A soft, upright landing on a pad scores; score scales with
  how gently you landed, the pad's difficulty, and leftover fuel.
- Three difficulty levels — **Novice / Intermediate / Expert** — that change
  starting fuel, gravity, and **how far the lander may rotate** (a safety rail).
- The original **zooms to a close-up** of the lander as it nears the surface.

---

## 2. Goal & loop

Touch down softly and upright on a flat pad. Each landing (or crash) resets with
**new terrain**; play continues until you run out of fuel. Score accumulates
across landings.

---

## 3. Controls (keyboard adaptation)

| Input | Action |
|---|---|
| ← / → | Rotate the lander |
| ↑ or Space (hold) | Main thruster (burns fuel while held) |
| P / Esc | Pause |
| M | Mute |
| Enter | Start / play again |
| Touch | On-screen ◀ ▲ ▶ thruster pad |

(The arcade's 10-step lever becomes hold-to-thrust on keyboard; a future tweak
could map throttle levels to keys.)

---

## 4. Physics & tuning (proposed constants — to verify by simulation)

Difficulty differs by **gravity and rotation cap** (fuel is the same for all):

| Level | Gravity (px/frame²) | Rotation cap |
|---|---|---|
| Novice | 0.018 | ±90° |
| Intermediate (default) | 0.025 | ±135° |
| Expert | 0.033 | full 360° |

- **Thrust:** `0.060` px/frame² along the lander's "up" while held (must beat
  gravity to climb). Burns `~0.9` fuel/frame.
- **Rotation:** `0.045` rad/frame, clamped to the level's cap (Expert = no clamp).
- **Fuel economy (real mode):** every game starts with **1000**; thrust burns it;
  **+100** on any successful landing (flat — *not* multiplied; the ×2–×5 is
  score-only); **−50** on a crash; **game over at 0**. **Low-fuel warning** (red
  FUEL + flashing "LOW FUEL" + beep) at **≤100**, all levels.
- **Unlimited fuel (practice):** a menu checkbox — fuel never depletes, the game
  never ends, and **no high score is posted**. Just for practice.

---

## 5. Terrain & pads

- A **wide** jagged lunar surface (`WORLD_W = 2600`) regenerated each round, with
  up to **~8 flat pads** of varying width — lots of fields/options to choose from.
- It **tiles seamlessly** (first/last point share a height) so the world scrolls
  endlessly: the lander's x is unbounded, the camera follows, and the terrain is
  drawn in 3 copies — no snap-back at a screen edge.
- **Pad multiplier by width:** widest `×2`, then `×3`, `×4`, smallest `×5`
  (smaller = harder = bigger payoff), shown flashing above each pad. You can also
  set down on **any flat ground** for base ×1 (slopes crash).

---

## 6. Landing criteria (tiered)

At the moment of contact on a flat pad:

- **Good (soft):** `|vy| ≤ 0.5` and `|vx| ≤ 0.4` and angle within `±6°` of vertical.
- **Hard (rough but survivable):** `|vy| ≤ 0.9` and `|vx| ≤ 0.7` and angle `±12°`
  — lands, reduced score.
- **Crash:** anything faster/more tilted, OR touching non-pad terrain.

**Score** ≈ `pad_multiplier × base(50) × softness` + `fuel_bonus`. Soft + small pad
+ fuel left = big score. (Exact curve tuned during build.)

---

## 7. Camera / zoom

The camera **follows the lander** and scales to keep the **ground pinned near the
bottom of the screen** (≈ y 570) at any altitude — a constant terrain reference.
`scale = clamp(ANCHOR_BUDGET(330) / altitude, 0.16, 2.2)`:

- **High up** → very zoomed out, and it zooms out *more* as you climb (terrain
  stays in view up to ~2000+ ft; min scale 0.16).
- **Only when really close** (alt < ~150) does the zoom cap at the **2.2 close-up**;
  the ground then rises to meet the lander for the touchdown.

You start high (`START_ALT ≈ 760`). Physics stays in fixed world coordinates; only
drawing scales. The terrain is drawn tiled across the full visible width at any zoom.

---

## 8. HUD

Match the original's readouts: **ALTITUDE · HORIZONTAL SPEED · VERTICAL SPEED ·
FUEL · SCORE**, with the speed values turning red when they exceed the safe
landing thresholds (instant feedback).

---

## 9. Difficulty & leaderboard

- A **difficulty selector** on the menu (Novice/Intermediate/Expert, default
  Intermediate) sets gravity, fuel, and the rotation cap.
- **Shared D1 leaderboard with initials**, one board **per difficulty**
  (game `lunar-lander`, config = `novice`/`intermediate`/`expert`), top-5, local
  fallback — same backend as the other games.

---

## 10. Template compliance

Access-key gate; cyan UI + amber ◀ ARCADE link in the hint line; standard **pause
menu** (RESUME · MENU · ◀ ARCADE) and **game-over menu** (PLAY AGAIN · MENU ·
◀ ARCADE) with initials entry; `P`/`Esc` pause, `M` mute; `noindex`. States:
`menu → playing → (paused) → over`.

---

## 11. Sources

- Lunar Lander (1979 video game) — Wikipedia: https://en.wikipedia.org/wiki/Lunar_Lander_(1979_video_game)
- Museum of the Game / Arcade Museum: https://www.arcade-museum.com/Videogame/lunar-lander
- Arcade History: https://www.arcade-history.com/?n=lunar-lander&page=detail&id=1417
