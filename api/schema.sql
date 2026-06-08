-- Leaderboard schema for Cloudflare D1.
-- One row per submitted score; "config" is the physics combination code
-- ("000".."111" = collisions/wormholes/blackhole toggles), matching the game.

CREATE TABLE IF NOT EXISTS scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  config     TEXT    NOT NULL,
  initials   TEXT    NOT NULL,
  score      INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- Fast "top 5 for this config" lookups.
CREATE INDEX IF NOT EXISTS idx_scores_config ON scores (config, score DESC);
