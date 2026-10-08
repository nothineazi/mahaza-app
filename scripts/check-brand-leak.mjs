#!/usr/bin/env node
// Anti-fuite de marque : aucune référence aux marques clientes (Mahaza, St Louis) dans la souche.
// Équivalent de `git grep -i` sur ces deux noms, sur les fichiers suivis et non ignorés (chemins compris).
// Exclus : `docs/` (le plan, les standards, les ADR et les rapports de run nomment les dépôts clients) et `CLAUDE.md`.
// Les motifs sont assemblés à l'exécution pour que ce fichier ne se signale pas lui-même.
// Usage : node scripts/check-brand-leak.mjs   (code de sortie 1 s'il trouve une fuite)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PATTERNS = [new RegExp(["maha", "za"].join(""), "i"), new RegExp(["st[ _-]?lo", "uis"].join(""), "i")];
const EXCLUDED = [/^docs\//, /^CLAUDE\.md$/];

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
