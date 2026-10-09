#!/usr/bin/env node
// Anti-fuite de marque : aucune référence aux marques des dépôts clients dans la souche (voir STANDARDS §10).
// Équivalent de `git grep -i` sur ces deux noms, sur les fichiers suivis et non ignorés (chemins compris).
// Exclus : `docs/` (le plan, les standards, les ADR et les rapports de run nomment les dépôts clients) et `CLAUDE.md`.
// Usage : node scripts/check-brand-leak.mjs   (code de sortie 1 s'il trouve une fuite)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Les motifs viennent de src/brand/forbidden-names.json (propre à chaque dépôt : la souche interdit les marques clientes,
// une app cliente interdit la souche et l'autre client). Ce fichier est lui-même exclu du contrôle.
const NAMES_FILE = "src/brand/forbidden-names.json";
const PATTERNS = JSON.parse(readFileSync(NAMES_FILE, "utf8")).patterns.map((p) => new RegExp(p, "i"));
const EXCLUDED = [/^docs\//, /^CLAUDE\.md$/, new RegExp(`^${NAMES_FILE.replace(/[.]/g, "\\.")}$`)];

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter((f) => f && !EXCLUDED.some((r) => r.test(f)));

const hits = [];
for (const file of files) {
  for (const re of PATTERNS) if (re.test(file)) hits.push(`${file}: (nom de fichier)`);
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue; // fichier supprimé dans l'arbre de travail
  }
  if (text.includes("\0")) continue; // binaire
  text.split("\n").forEach((line, i) => {
    if (PATTERNS.some((re) => re.test(line))) hits.push(`${file}:${i + 1}: ${line.trim().slice(0, 140)}`);
  });
}

if (hits.length) {
  console.error(`Anti-fuite de marque : ${hits.length} occurrence(s)\n${hits.join("\n")}`);
  process.exit(1);
}
console.log(`Anti-fuite de marque : aucune occurrence (${files.length} fichiers analysés)`);
