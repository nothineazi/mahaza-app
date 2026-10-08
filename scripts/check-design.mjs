#!/usr/bin/env node
// Garde-fou du design system du back-office (docs/reference/factory-core.md §10, adapté à notre arborescence).
//
// Périmètre : le back-office (`src/app/admin`, `src/ui/admin`) et les composants kv (`src/ui/kv`).
// Hors périmètre, volontairement : le site public (registre premium éditorial : `src/ui/home`, `booking`, `site`, `primitives`,
// `src/app/(page d'accueil, /reserver)`), `node_modules`, les fichiers CSS.
//
// Motifs contrôlés (chacun a une raison dans la factory) :
//   style en ligne · palette locale (`const C = {`) · couleur codée en dur (#hex, rgb(), hsl(), oklch()) ·
//   tailles hors échelle kv (text-xs, text-sm, text-[…px]) · rayons réservés au site public (rounded-2xl et plus) ·
//   espacements bannis (p-6, py-16, gap-3) · graisses interdites (font-bold, font-extrabold, font-black) · ombres du registre premium.
//
// Exception légitime (largeur calculée, position du planning…) : commentaire `check-design-allow: <raison>` sur la ligne
// ou la ligne précédente. Le contrôle exige une raison non vide et compte les exceptions.
//
// Usage : node scripts/check-design.mjs [--strict]   (--strict : code de sortie 1 s'il reste une violation ; actif en CI)
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const SCOPE = ["src/app/admin", "src/ui/admin", "src/ui/kv"];

const PATTERNS = [
  { id: "style-inline", why: "style={{…}} : utiliser une classe (ou déclarer l'exception)", re: /style=\{\{/ },
  { id: "palette-locale", why: "palette locale `const C = {` : utiliser les jetons", re: /\bconst\s+C\s*=\s*\{/ },
  { id: "couleur-en-dur", why: "couleur codée en dur : utiliser un jeton", re: /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\(/ },
  { id: "taille-hors-echelle", why: "text-xs / text-sm / text-[…] : utiliser l'échelle text-kv-*", re: /(?<![\w-])text-(?:xs|sm|\[[^\]]+\])(?![\w-])/ },
  { id: "rayon-public", why: "rounded-2xl et plus : réservés au site public", re: /(?<![\w-])rounded-(?:[a-z]+-)?(?:2xl|3xl|4xl)(?![\w-])/ },
  { id: "espacement-banni", why: "p-6, py-16, gap-3 : bannis (échelle 8 / 16 / 24 / 32)", re: /(?<![\w-])(?:p-6|py-16|gap-3)(?![\w/-])/ },
  { id: "graisse-interdite", why: "font-bold / extrabold / black : graisses 450 / 520 / 600 uniquement", re: /(?<![\w-])font-(?:bold|extrabold|black)(?![\w-])/ },
  { id: "ombre-premium", why: "shadow-soft / shadow-lift : ombres du site public", re: /(?<![\w-])shadow-(?:soft|lift)(?![\w-])/ },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "node_modules") yield* walk(p);
    } else if (/\.(ts|tsx)$/.test(name)) yield p;
  }
}

const ALLOW = /check-design-allow:\s*(\S.*)$/;
const violations = [];
let allowed = 0;
let files = 0;
for (const scope of SCOPE) {
  for (const file of walk(join(root, scope))) {
    files++;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const p of PATTERNS) {
        if (!p.re.test(line)) continue;
        const exempt = ALLOW.test(line) || (i > 0 && ALLOW.test(lines[i - 1]));
        if (exempt) allowed++;
        else violations.push({ id: p.id, file: relative(root, file), line: i + 1, text: line.trim().slice(0, 110) });
      }
    });
  }
}

const byPattern = new Map(PATTERNS.map((p) => [p.id, 0]));
const byFile = new Map();
for (const v of violations) {
  byPattern.set(v.id, byPattern.get(v.id) + 1);
  byFile.set(v.file, (byFile.get(v.file) ?? 0) + 1);
}

console.log(`check-design : ${files} fichiers analysés (${SCOPE.join(", ")}) · ${allowed} exception(s) déclarée(s) · ${violations.length} violation(s)`);
for (const p of PATTERNS) console.log(`  ${String(byPattern.get(p.id)).padStart(4)}  ${p.id} — ${p.why}`);
if (violations.length) {
  console.log("\nFichiers les plus touchés :");
  for (const [file, n] of [...byFile].sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${String(n).padStart(4)}  ${file}`);
  if (strict || violations.length <= 40) {
    console.log("\nDétail :");
    for (const v of violations.slice(0, 60)) console.log(`  ${v.file}:${v.line} [${v.id}] ${v.text}`);
  }
}
process.exit(strict && violations.length ? 1 : 0);
