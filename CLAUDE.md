# Claude instructions — daves-arcade

- **Always verify Cloudflare/GitHub specifics against live docs before
  answering** (use the Cloudflare docs MCP search and/or web search; never
  answer platform questions from training memory alone).
- Hosting: Cloudflare Workers static assets (`wrangler.jsonc`), production
  branch `main`, auto-deployed via Workers Builds GitHub integration.
  Non-production branch builds are intentionally DISABLED — do not enable.
- The repo is PRIVATE on purpose (key-gated site, noindex). Never make it
  public; never expose new URLs beyond `*.chateaufuente.workers.dev`.
- Never push without Dave's explicit per-push permission.

## Formatting for Dave (non-coder)

- **Always render URLs as clickable markdown links** — `[label](https://...)`,
  never bare URLs inside backticks/code spans (those aren't clickable).
- **When pointing Dave to a file on his Mac**, chat links can't open his local
  filesystem — always give the full path PLUS how to get there: Finder →
  **Cmd+Shift+G** → paste the path (needed for hidden dot-folders like
  `~/.claude`), or a copy-paste Terminal `open` command.
