import { Database } from "bun:sqlite";
import { resolve } from "node:path";

const DEFAULT_API_KEY = "xxx";
const DEFAULT_DB_PATH = resolve(import.meta.dirname!, "../data.db");

interface StockItem {
  id: number;
  symbol: string;
  name: string;
  logo: string | null;
}

interface FinvizStockItem {
  id: number;
  symbol: string;
  name: string;
}

interface StockRow {
  id: number;
  symbol: string;
  name: string;
  logo: Uint8Array;
}

// Fetch stock data via Finviz API
async function FinvizScreenerData(apiKey: string): Promise<FinvizStockItem[]> {
  const url = `https://elite.finviz.com/export/screener?v=152&c=0,1,2&auth=${apiKey}`;
  const response = await fetch(url);
  const text = await response.text();

  const { parse } = await import("csv-parse/sync");
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return records.map((r) => ({
    id: parseInt(r["No."]!),
    symbol: r["Ticker"]!,
    name: r["Company"]!,
  }));
}

interface BenzingaLogoItem {
  id: string;
  search_key: string;
  files: {
    mark_composite_dark: string;
  };
  created_at: string;
  updated_at: string;
}

interface BenzingaLogo {
  data: BenzingaLogoItem[];
}

async function BenzingaLogoData(symbols: string[]): Promise<BenzingaLogo> {
  const url = `https://www.benzinga.com/api-next/quotes/logos?composite_auto=true&fields=mark_composite_dark&scale=100x100&search_keys=${symbols.join(",")}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  const text = await response.text();
  return JSON.parse(text) as BenzingaLogo;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function renderProgress(current: number, total: number, label: string) {
  const width = 30;
  const filled = Math.round((current / total) * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  const pct = Math.round((current / total) * 100);
  process.stdout.write(`\r${label}: [${bar}] ${current}/${total} (${pct}%)`);
  if (current === total) process.stdout.write("\n");
}

async function mergeLogoData(finvizItems: FinvizStockItem[], chunkSize: number): Promise<StockItem[]> {
  const chunks = chunkArray(finvizItems, chunkSize);
  const allResults: StockItem[][] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    const symbols = chunk.map((item) => item.symbol);

    try {
      const { data: logoItems } = await BenzingaLogoData(symbols);
      const logoMap = new Map(logoItems.map((l) => [l.search_key, l.files.mark_composite_dark]));

      allResults.push(
        chunk.map(
          (item): StockItem => ({
            id: item.id,
            symbol: item.symbol,
            name: item.name,
            logo: logoMap.get(item.symbol) ?? null,
          }),
        ),
      );
    } catch (err) {
      console.warn(`\nBenzinga API request failed [${symbols.slice(0, 3).join(",")}...]: ${(err as Error).message}`);
      allResults.push(
        chunk.map(
          (item): StockItem => ({
            id: item.id,
            symbol: item.symbol,
            name: item.name,
            logo: null,
          }),
        ),
      );
    }

    renderProgress(i + 1, chunks.length, "Merge Logo");
    await delay(200);
  }

  return allResults.flat();
}

async function textToAvatar(symbol: string): Promise<Uint8Array> {
  const url = `https://ui-avatars.com/api/?name=${symbol}&size=100&background=random&color=fff&font-size=0.5`;
  const res = await fetch(url);
  return new Uint8Array(await res.arrayBuffer());
}

async function downloadLogos(items: StockItem[]): Promise<StockRow[]> {
  const results: StockRow[] = new Array(items.length);
  let completed = 0;
  let cursor = 0;
  const CONCURRENCY = 6;

  const worker = async () => {
    while (cursor < items.length) {
      const i = cursor++;
      const item = items[i]!;

      let logo: Uint8Array;
      if (item.logo) {
        try {
          const res = await fetch(item.logo);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          logo = new Uint8Array(await res.arrayBuffer());
        } catch {
          logo = await textToAvatar(item.symbol);
        }
      } else {
        logo = await textToAvatar(item.symbol);
      }

      results[i] = { id: item.id, symbol: item.symbol, name: item.name, logo };
      completed++;
      if (completed % 100 === 0) {
        renderProgress(completed, items.length, "Download Logo");
      }
    }
  };

  console.log(`Downloading ${items.length} logos (concurrency: ${CONCURRENCY})`);
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  renderProgress(completed, items.length, "Download Logo");
  return results;
}

function writeToDB(dbPath: string, rows: StockRow[]) {
  const db = new Database(dbPath);

  console.log("Clearing stocks table...");
  db.run("DELETE FROM stocks");
  db.run("DELETE FROM sqlite_sequence WHERE name = 'stocks'");

  console.log(`Writing ${rows.length} records...`);
  const insert = db.prepare(
    "INSERT INTO stocks (id, symbol, name, logo) VALUES ($id, $symbol, $name, $logo)",
  );

  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const tx = db.transaction((items: StockRow[]) => {
      for (const item of items) {
        insert.run({ $id: item.id, $symbol: item.symbol, $name: item.name, $logo: item.logo });
      }
    });
    tx(batch);
    renderProgress(Math.min(i + BATCH, rows.length), rows.length, "Write DB");
  }

  db.close();
  console.log("Database write complete!");
}

async function main() {
  console.log("=== DTBox Stocks Update Tool. ===\n");

  const apiKey = prompt("Enter Finviz API Key", DEFAULT_API_KEY)?.trim() || DEFAULT_API_KEY;
  const dbPath = prompt("Enter SQLite file path", DEFAULT_DB_PATH)?.trim() || DEFAULT_DB_PATH;
  const chunkSize = parseInt(prompt("Enter mergeLogoData chunk size", "10") || "10", 10) || 10;

  console.log(`API Key: ${apiKey.slice(0, 8)}...`);
  console.log(`DB Path: ${dbPath}`);
  console.log(`Chunk Size: ${chunkSize}\n`);

  // Step 1
  console.log("Fetching Finviz stock list...");
  const finvizItems = await FinvizScreenerData(apiKey);
  console.log(`Finviz returned ${finvizItems.length} stocks\n`);

  // Step 2-4
  const merged = await mergeLogoData(finvizItems, chunkSize);

  // Step 5
  const rows = await downloadLogos(merged);

  // Step 6
  writeToDB(dbPath, rows);
}

await main();
