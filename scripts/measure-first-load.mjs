#!/usr/bin/env node
// Mesure le « First Load JS » (octets gzip, comme l'affichait Next 15) de chaque route, à partir de
// .next/diagnostics/route-bundle-stats.json produit par `next build` (Next 16 n'affiche plus cette colonne).
// Usage : node scripts/measure-first-load.mjs [--json] [--budget fichier.json]
//   --budget : fichier { "/": 142, "/reserver": 168 } en kB ; code de sortie 1 si une route le dépasse.
import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const root = process.cwd();
const stats = JSON.parse(readFileSync(join(root, ".next/diagnostics/route-bundle-stats.json"), "utf8"));
const kB = (bytes) => Math.round(bytes / 100) / 10; // 1 kB = 1000 octets, une décimale (convention de Next)

const rows = stats.map((r) => {
  const gz = r.firstLoadChunkPaths.reduce((sum, p) => sum + gzipSync(readFileSync(join(root, p)), { level: 9 }).length, 0);
  return { route: r.route, gzipKB: kB(gz), rawKB: kB(r.firstLoadUncompressedJsBytes) };
}).sort((a, b) => a.route.localeCompare(b.route));

const budgetIdx = process.argv.indexOf("--budget");
const budget = budgetIdx > 0 ? JSON.parse(readFileSync(process.argv[budgetIdx + 1], "utf8")) : null;

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.log("Route".padEnd(24) + "gzip (kB)".padStart(11) + "brut (kB)".padStart(11));
  for (const r of rows) console.log(r.route.padEnd(24) + String(r.gzipKB).padStart(11) + String(r.rawKB).padStart(11));
}

let bad = 0;
if (budget) {
  for (const r of rows) {
    if (budget[r.route] != null && r.gzipKB > budget[r.route]) {
      console.error(`DÉPASSEMENT ${r.route} : ${r.gzipKB} kB > budget ${budget[r.route]} kB`);
      bad++;
    }
  }
}
process.exit(bad ? 1 : 0);
