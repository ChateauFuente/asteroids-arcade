// Cloudflare Worker: a tiny shared-leaderboard API backed by D1, for the arcade.
//
// Scores are namespaced by GAME and (within a game) by CONFIG:
//   - Asteroids uses config "000".."111" (its 8 physics combos).
//   - Stunt Cycle / Lunar Lander use per-difficulty configs.
//
// Endpoints (all require ?key=<ARCADE_KEY>):
//   GET  /scores?game=asteroids            -> { "000":[{initials,score}...], ... }
//   GET  /scores?game=asteroids&config=110 -> [{initials,score}, ...]  (top 5)
//   POST /scores  body { game, config, initials, score }
//
// `game` defaults to "asteroids" so the original Asteroids client keeps working.
//
// HARDENING (the access key is public — it ships in the client — so the POST
// endpoint is treated as untrusted input from the internet):
//   1. Scores are validated against a per-game sanity cap (no absurd values).
//   2. After every insert the board is PRUNED to the top N, so the table
//      physically cannot grow no matter how many scores are posted.
//   3. Each IP is rate-limited (a small `rate` table) so it can't be flooded.
// None of this can stop a determined person from posting *a* fake score from a
// static page (any shipped key is readable) — it just keeps that harmless:
// they can only add a competing row, never edit/delete real scores, bloat the
// table, or run up cost.

const TOP_N = 5;

// Largest plausible score per game; anything above is rejected as garbage.
// Generous on purpose — high enough to never reject a real marathon run.
const MAX_SCORE = { asteroids: 9999999, "stunt-cycle": 200000, "lunar-lander": 2000000 };
const DEFAULT_MAX_SCORE = 9999999;

// Per-IP POST rate limit: at most RATE_MAX inserts per RATE_WINDOW ms.
const RATE_WINDOW = 60000;   // 1 minute
const RATE_MAX = 15;         // generous for real play, throttles scripted floods

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOW_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}
const cleanGame = g => String(g || "asteroids").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24) || "asteroids";
const cleanConfig = c => String(c || "").replace(/[^A-Za-z0-9]/g, "").slice(0, 12);

// Fixed-window per-IP limiter backed by the `rate` table. Returns true if the
// caller is over the limit (and should be rejected). Best-effort: if the table
// is missing or the query fails, we fail OPEN (never block a real player).
async function overRateLimit(env, ip, now) {
  try {
    // Opportunistic cleanup so the table can't accumulate stale IPs forever.
    await env.DB.prepare("DELETE FROM rate WHERE ts < ?").bind(now - 3600000).run();
    const row = await env.DB.prepare("SELECT ts, n FROM rate WHERE ip = ?").bind(ip).first();
    if (row && now - row.ts < RATE_WINDOW) {
      if (row.n >= RATE_MAX) return true;
      await env.DB.prepare("UPDATE rate SET n = n + 1 WHERE ip = ?").bind(ip).run();
    } else {
      await env.DB.prepare(
        "INSERT INTO rate (ip, ts, n) VALUES (?, ?, 1) ON CONFLICT(ip) DO UPDATE SET ts = excluded.ts, n = 1"
      ).bind(ip, now).run();
    }
  } catch (e) {
    return false;
  }
  return false;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(env);

    if (request.method === "OPTIONS") return new Response(null, { headers });

    if (env.ARCADE_KEY && url.searchParams.get("key") !== env.ARCADE_KEY) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers });
    }

    if (url.pathname === "/scores" && request.method === "GET") {
      const game = cleanGame(url.searchParams.get("game"));
      const config = cleanConfig(url.searchParams.get("config"));
      if (config) {
        const rows = await env.DB.prepare(
          "SELECT initials, score, param FROM scores WHERE game = ? AND config = ? ORDER BY score DESC LIMIT ?"
        ).bind(game, config, TOP_N).all();
        return new Response(JSON.stringify(rows.results), { headers });
      }
      // No config: every board for this game, grouped, top 5 each.
      const rows = await env.DB.prepare(
        "SELECT config, initials, score, param FROM scores WHERE game = ? ORDER BY config, score DESC"
      ).bind(game).all();
      const boards = {};
      for (const r of rows.results) {
        if (!boards[r.config]) boards[r.config] = [];
        if (boards[r.config].length < TOP_N) boards[r.config].push({ initials: r.initials, score: r.score, param: r.param });
      }
      return new Response(JSON.stringify(boards), { headers });
    }

    if (url.pathname === "/scores" && request.method === "POST") {
      const now = Date.now();
      const ip = request.headers.get("CF-Connecting-IP") || "0";
      if (await overRateLimit(env, ip, now)) {
        return new Response(JSON.stringify({ error: "rate limited" }), { status: 429, headers });
      }

      const body = await request.json().catch(() => ({}));
      const game = cleanGame(body.game);
      const config = cleanConfig(body.config);
      const initials = String(body.initials || "AAA").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3) || "AAA";
      const score = Math.max(0, Math.floor(Number(body.score) || 0));
      const param = (body.param === null || body.param === undefined || body.param === "")
        ? null : Math.max(0, Math.min(100, Math.floor(Number(body.param) || 0)));
      if (!config) {
        return new Response(JSON.stringify({ error: "bad config" }), { status: 400, headers });
      }
      // Reject implausible scores (cheap anti-garbage; per-game cap).
      const cap = MAX_SCORE[game] || DEFAULT_MAX_SCORE;
      if (!Number.isFinite(score) || score > cap) {
        return new Response(JSON.stringify({ error: "bad score" }), { status: 400, headers });
      }

      await env.DB.prepare(
        "INSERT INTO scores (game, config, initials, score, param, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(game, config, initials, score, param, now).run();

      // Prune this board to the top N so the table can never grow unbounded.
      await env.DB.prepare(
        "DELETE FROM scores WHERE game = ? AND config = ? AND id NOT IN (" +
        "SELECT id FROM scores WHERE game = ? AND config = ? ORDER BY score DESC, id ASC LIMIT ?)"
      ).bind(game, config, game, config, TOP_N).run();

      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers });
  },
};
