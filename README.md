# Dave Z's Arcade

A small sandbox arcade of self-contained, wireframe-style browser games. Each
game is one HTML file — no build step. Hosted on GitHub Pages; gated by an access
key in the URL (`?key=...`) with a `noindex` tag + `robots.txt` so it stays out
of search engines. Opening files locally skips the key.

The root `index.html` is the **arcade menu** — it lists the games and passes the
key through to whichever you pick.

## Games

| Game | Folder | Spec |
|---|---|---|
| **Asteroids on Steroids** | `asteroids/` | [SPEC](asteroids/SPEC.md) |
| **Stunt Cycle** | `stunt-cycle/` | [SPEC](stunt-cycle/SPEC.md) |

## Layout

```
index.html         Arcade menu (game launcher).
robots.txt         Keeps search engines out.
CHANGELOG.md       Unified history for the whole arcade + every game.
README.md          This file.
asteroids/         Game + its master SPEC.md.
stunt-cycle/       Game + its master SPEC.md.
api/               Shared Cloudflare Worker + D1 leaderboard backend
                   (used by Asteroids; deployed separately).
```

Each game has its **own master spec** in its folder; the **changelog is unified**
at the root.

## Adding a game

1. Create `new-game/index.html` (copy a gate + the canvas/loop pattern).
2. Add a card/link to it in the root `index.html` (pass the key through).
3. Add `new-game/SPEC.md`; add an entry to `CHANGELOG.md`.

## Backend (shared leaderboard)

Asteroids posts per-configuration top-5 scores to a Cloudflare Worker (`arcade-api`)
backed by D1 (`arcade_leaderboard`); it falls back to per-browser scores when the
API is unreachable. See [`api/README.md`](api/README.md). Stunt Cycle currently
keeps scores locally and can adopt the same backend later (add a `game` column).
