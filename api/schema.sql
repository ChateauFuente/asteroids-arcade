-- Leaderboard schema for Cloudflare D1 (shared by every game in the arcade).
-- One row per submitted score. "game" namespaces the board (e.g. "asteroids",
-- "stunt-cycle"); "config" sub-divides within a game (Asteroids: "000".."111"
-- physics combos; Stunt Cycle: "main").

CREATE TABLE IF NOT EXISTS scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  game       TEXT    NOT NULL DEFAULT 'asteroids',
  config     TEXT    NOT NULL,
  initials   TEXT    NOT NULL,
  score      INTEGER NOT NULL,
  param      INTEGER,            -- optional per-score note (e.g. black-hole gravity %)
  created_at INTEGER NOT NULL
);

-- Fast "top 5 for this game+config" lookups.
CREATE INDEX IF NOT EXISTS idx_scores_game ON scores (game, config, score DESC);
