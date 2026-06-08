// Cloudflare Worker: a tiny shared-leaderboard API backed by D1.
//
// Endpoints:
//   GET  /scores              -> { "000": [{initials,score}...], "001": [...], ... }
//   GET  /scores?config=110   -> [{initials,score}, ...]  (top 5 for one config)
//   POST /scores              -> body { config, initials, score }
//
// It is gated by a shared key (set with `wrangler secret put ARCADE_KEY`) and
// only talks to the D1 database bound as DB in wrangler.toml. Deploy steps are
// in api/README.md. Until deployed, the game falls back to per-browser scores.

const TOP_N = 5;

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOW_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders(env);

    if (request.method === "OPTIONS") return new Response(null, { headers });

    // Shared-secret gate so random visitors can't read or spam the board.
    if (env.ARCADE_KEY && url.searchParams.get("key") !== env.ARCADE_KEY) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers });
    }

    if (url.pathname === "/scores" && request.method === "GET") {
      const config = url.searchParams.get("config");
      if (config) {
        const rows = await env.DB.prepare(
          "SELECT initials, score FROM scores WHERE config = ? ORDER BY score DESC LIMIT ?"
        ).bind(config, TOP_N).all();
        return new Response(JSON.stringify(rows.results), { headers });
      }
      // No config given: return every board, grouped, top 5 each.
      const rows = await env.DB.prepare(
        "SELECT config, initials, score FROM scores ORDER BY config, score DESC"
      ).all();
      const boards = {};
      for (const r of rows.results) {
        if (!boards[r.config]) boards[r.config] = [];
        if (boards[r.config].length < TOP_N) boards[r.config].push({ initials: r.initials, score: r.score });
      }
      return new Response(JSON.stringify(boards), { headers });
    }

    if (url.pathname === "/scores" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const config = String(body.config || "");
      const initials = String(body.initials || "AAA").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3) || "AAA";
      const score = Math.max(0, Math.floor(Number(body.score) || 0));
      if (!/^[01]{3}$/.test(config)) {
        return new Response(JSON.stringify({ error: "bad config" }), { status: 400, headers });
      }
      await env.DB.prepare(
        "INSERT INTO scores (config, initials, score, created_at) VALUES (?, ?, ?, ?)"
      ).bind(config, initials, score, Date.now()).run();
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers });
  },
};
