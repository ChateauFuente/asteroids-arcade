// Cloudflare Worker: a tiny shared-leaderboard API backed by D1, for the arcade.
//
// Scores are namespaced by GAME and (within a game) by CONFIG:
//   - Asteroids uses config "000".."111" (its 8 physics combos).
//   - Stunt Cycle uses a single config "main".
//
// Endpoints (all require ?key=<ARCADE_KEY>):
//   GET  /scores?game=asteroids            -> { "000":[{initials,score}...], ... }
//   GET  /scores?game=asteroids&config=110 -> [{initials,score}, ...]  (top 5)
//   GET  /scores?game=stunt-cycle&config=main -> top 5 for that board
//   POST /scores  body { game, config, initials, score }
//
// `game` defaults to "asteroids" so the original Asteroids client keeps working.

const TOP_N = 5;

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
      await env.DB.prepare(
        "INSERT INTO scores (game, config, initials, score, param, created_at) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(game, config, initials, score, param, Date.now()).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers });
  },
};
