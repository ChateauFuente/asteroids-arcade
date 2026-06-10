# Changelog — Dave Z's Arcade

Unified history for the whole arcade (the menu and every game). Newest first.
Built iteratively in a single development channel; dates reflect that work
(2026-06-08). Per-game design details live in each game's `SPEC.md`.

## [Unreleased]
### Lunar Lander (new)
- **Third game added.** Wireframe homage to Atari's 1979 Lunar Lander: fight
  gravity and momentum, manage limited fuel, and set down soft & upright on a
  flashing pad (smaller pads = higher ×2–×5 multiplier). Soft landings refuel;
  game over when the tank's dry.
- **Three difficulties** (Novice / Intermediate / Expert, default Intermediate)
  differing by start fuel, gravity, and rotation cap (±90° / ±135° / full 360°),
  each with its **own shared D1 leaderboard**. HUD shows altitude, H/V speed
  (red when too hot), fuel, score. Physics verified fair by simulation.
- Added to the arcade menu; follows the full template (pause/game-over/controls/
  style/leaderboard).
- **Altitude zoom camera** (follows the lander; zooms out when high, in for the
  final approach), **more mountainous terrain**, and you can now **set down on any
  flat ground for base ×1 points** (marked pads still add their ×2–×5); slopes
  crash. Crashes throw debris.
- **Start higher + zoomed out, wide seamless world.** Start altitude ~2.5× higher
  and the camera starts zoomed out (broad landscape) then zooms in on descent. The
  landscape is now a wide (2600px) field with up to ~8 pads that **scrolls
  endlessly** — the lander flies past the old screen edge with continuous tiling
  instead of snapping back to the left.
- **Smoother camera + new fuel economy.** Smoothed the zoom (drives off an eased
  altitude) so it no longer pumps as the lander passes over terrain bumps. Fuel:
  every game starts at **1000** (same for all levels — difficulty is now gravity +
  rotation cap), **+100 × the pad multiplier** on a successful landing (×1 flat
  ground … up to ×5 on the smallest pad → +500 fuel), **−50** on a crash,
  **low-fuel warning at ≤100** (red + flashing "LOW FUEL" + beep), game over at 0.
  (Was a flat +100 — multiplying the fuel reward lets a good pilot build a reserve.) Added an **Unlimited Fuel (practice)** menu checkbox — endless, no high
  score. Verified by simulation (−50/crash, warning, game-over at 0, ∞ in practice).
- **Reworked the zoom to keep terrain always in view.** Scale now pins the ground
  near the bottom of the screen (`330/alt`, clamped 0.16–2.2): it stays zoomed out
  while high and zooms out *more* as you climb (terrain visible to ~2000+ ft),
  and only caps the zoom-in (2.2) within ~150 ft for the landing — instead of the
  old curve that zoomed in too fast and lost the landscape.

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
- **Proper HTML start menu with a START button** (fixes: couldn't start on mobile;
  was a canvas "PRESS ENTER TO START" screen). Now matches the template — tappable
  START + the leaderboard on the menu overlay. Added the HTML start menu to the
  shared template too.
- **Three-lane run-up + doubled throttle.** Added a second stacked run-up lane
  (top + middle, zig-zagging via two tubes into the jump lane) and doubled the
  throttle cap to MAX_S=30 (same fill rate). Simulation: this raises the ceiling
  from ~25 to **~50 buses**; the fit-to-screen zoom stays readable (vs≈0.47 at 48).
- **Opaque game-over screen** — fills black with a dialog frame so the run-up
  lanes no longer show through the score/leaderboard.
- **Fixed the "invisible wall" on long bus rows.** The off-screen crash boundary
  used the fixed screen width, so once the ramp extended past it (~16+ buses) the
  bike exploded mid-air before reaching the ramp. It's now relative to the ramp
  end (`landEnd + 80`). Verified by simulation: 19+ buses are landable again
  (near-max throttle), with the real ceiling at ~22–23 buses (max launch speed).
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

### Arcade / mobile
- **Controls moved OUTSIDE the play box (all games).** The on-screen buttons are
  now `position: fixed` in the screen's side gutters (and top corners) instead of
  overlaying the 4:3 canvas, so they no longer cover the playfield or the score/HUD
  on phones. iPhone notch handled via `env(safe-area-inset-*)`. Asteroids: rotate-
  LEFT bottom-left with HYPER above it; rotate-RIGHT bottom-right (farthest out)
  with FIRE then THRUST above; PAUSE top-left, MUTE top-right. Stunt Cycle:
  SLOWER/lean-back left, FASTER/lean-forward right. Lunar Lander: rotate + thrust
  on each side.
- **Fullscreen / hide the URL bar.** Tapping START (or PLAY AGAIN) now requests
  fullscreen, which hides the browser URL bar on Android Chrome. Added
  `apple-mobile-web-app-capable` / `mobile-web-app-capable` / status-bar /
  `viewport-fit=cover` meta so that **Add to Home Screen** launches each game in
  true fullscreen (no URL bar) on iPhone — the reliable iOS path, since Safari
  ignores the JS fullscreen request.
- **On-screen thumb controls (all games).** Replaced the button row below the
  canvas with buttons that overlay the play area in thumb zones (shown only during
  play): rotation/secondary on the left, primary actions on the right, and PAUSE
  (top-left) + MUTE (top-right) as buttons (P/M keys don't exist on a phone).
  Asteroids: ◀▶ left; HYPER / THRUST / FIRE right, with **FIRE long-press = toggle
  auto-fire**. Lunar Lander: rotate + thrust on each side. Stunt Cycle: SLOWER/back
  on the left, FASTER/forward on the right.
- **Landscape lock (all games).** On phones the game now requires landscape; in
  portrait it shows a "ROTATE TO LANDSCAPE" overlay and freezes, auto-resuming
  (no pause) when you rotate back.

### Arcade / navigation
- **Landscape + portrait support (all games).** The 4:3 canvas now fits within
  both the screen width and height (`min(100vw, 80vh·4/3)`), so it works in either
  orientation and re-fits automatically when you rotate the phone mid-game; a
  short-screen media query shrinks the controls to fit in landscape.
- **Standard pause menu in every game:** RESUME · MENU (game's own title) · ◀ ARCADE.
  Asteroids' pause gained the ARCADE button; Stunt Cycle's pause went from
  resume-only to the full menu. Codified as the shared game template.
- **Standard game-over menu in every game:** PLAY AGAIN · MENU · ◀ ARCADE. Stunt
  Cycle's canvas game-over gained the matching button row (after initials entry).
- **Back-to-arcade everywhere.** Asteroids now has a ◀ ARCADE link (amber) in the
  hint line and an ARCADE button on the game-over screen; Stunt Cycle's link is
  amber to match. Both carry the access key back to the menu.

### Asteroids
- **Wormhole self-bullets.** A bullet that travels back through a wormhole can now
  hit its own shooter — your shot can kill your ship, and the saucer can destroy
  itself with its own shot (no points for that). Fresh, un-warped shots are safe.
- **Black-hole gravity rescaled** to a 0–100% slider (default **15%**); 100% now
  equals the old "really hard" ~30% setting, so the whole range is more usable.
- **Black-hole % on the leaderboard:** black-hole scores record the gravity % and
  show it in purple next to the score (e.g. `4340 (15%)`) — easy run vs. brutal.
- **Spawn spacing:** the black hole now keeps clear of the ship, the center
  respawn point, and the wormholes, so a new wave never drops it on top of you or
  another object.
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
