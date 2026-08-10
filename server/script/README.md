# dtbox-server-script

Helper scripts for DTBox server.

## Install

```bash
bun install
```

## Scripts

### update_stocks_table.ts

One-click update the `stocks` table in the server's SQLite database. Fetches the full stock listing from Finviz, enriches each stock with a logo from Benzinga (falling back to text-to-avatar), then writes everything into `data.db`.

```bash
bun run update_stocks_table.ts
```

**Interactive prompts on startup:**

| Prompt | Default | Description |
|--------|---------|-------------|
| Enter Finviz API Key | Pre-filled | Your elite.finviz.com API key |
| Enter SQLite file path | `../data.db` | Path to the server's SQLite database |
| Enter mergeLogoData chunk size | `10` | Symbols per Benzinga logo API call |

**Pipeline:**

1. **Fetch** — Pulls the full screener export from `elite.finviz.com/export/screener` (columns: No./Ticker/Company)
2. **Merge** — Splits into chunks, queries Benzinga `quotes/logos` for logo URLs, merges into `StockItem[]`
3. **Download** — Downloads each logo PNG (6 concurrent); falls back to `ui-avatars.com` if no logo URL or download fails
4. **Write** — Clears `stocks` table (resets auto-increment), bulk-inserts all records with binary PNG data

**Requirements:**

- Proxy may be needed (e.g. `export HTTPS_PROXY="http://127.0.0.1:7890"`) if Benzinga API returns Cloudflare 403

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
