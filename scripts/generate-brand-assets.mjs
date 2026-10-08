#!/usr/bin/env node
// Génère les illustrations SVG abstraites d'OVAGLOW (marque FICTIVE) : aucune photo, aucun visage, aucun média tiers.
// Usage : node scripts/generate-brand-assets.mjs   (écrit dans public/brand/ et src/app/icon.svg ; sortie déterministe)
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (rel, svg) => {
  const file = join(root, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg.trim() + "\n");
  console.log("écrit", rel);
};

// Palette (voir src/brand/theme/tokens.css)
const P = {
  ink: "#14201F", deep: "#1F5B5E", teal: "#2E7C80", mist: "#E6EEEC", sand: "#EFECE6", ivory: "#F8F6F2", brass: "#C9A15B", brassLight: "#E3C98F",
};

const svg = (w, h, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" ${extra} role="img" aria-hidden="true" focusable="false">${body}</svg>`;

const defs = (id, a, b, angle = 0) =>
  `<defs><linearGradient id="${id}" gradientTransform="rotate(${angle} .5 .5)"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;

/** Feuille stylisée : deux arcs qui se rejoignent en pointe. */
const leaf = (x, y, len, rot, fill, opacity = 1) =>
  `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0 0 C ${len * 0.35} ${-len * 0.38}, ${len * 0.8} ${-len * 0.25}, ${len} 0 C ${len * 0.8} ${len * 0.25}, ${len * 0.35} ${len * 0.38}, 0 0 Z" fill="${fill}" opacity="${opacity}"/>`;

const stones = (cx, base, scale, fills) =>
  fills
    .map((f, i) => {
      const rx = (150 - i * 32) * scale;
      const ry = (44 - i * 6) * scale;
      const y = base - i * ry * 1.7;
      return `<ellipse cx="${cx + (i % 2 ? 6 : -6) * scale}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"/>`;
    })
    .join("");

const wave = (y, amp, fill, opacity, w = 1290, h = 610) =>
  `<path d="M0 ${y} C ${w * 0.18} ${y - amp}, ${w * 0.32} ${y + amp}, ${w * 0.5} ${y} S ${w * 0.82} ${y - amp}, ${w} ${y} L ${w} ${h} L 0 ${h} Z" fill="${fill}" opacity="${opacity}"/>`;

// --- Hero 1 : galets empilés et feuillage
out(
  "public/brand/hero-1.svg",
  svg(
    1290,
    610,
    defs("g", P.ink, P.deep, 20) +
      `<rect width="1290" height="610" fill="url(#g)"/>` +
      `<circle cx="1030" cy="190" r="150" fill="${P.brass}" opacity=".18"/><circle cx="1030" cy="190" r="96" fill="${P.brassLight}" opacity=".22"/>` +
      stones(1000, 540, 1, [P.mist, P.sand, P.brassLight, P.teal, P.deep]) +
      leaf(820, 560, 190, -62, P.teal, 0.8) + leaf(840, 560, 150, -40, P.deep, 0.9) + leaf(1190, 560, 200, -118, P.teal, 0.8) + leaf(1170, 565, 150, -140, P.brass, 0.7) +
      wave(590, 14, P.ink, 0.5),
  ),
);

// --- Hero 2 : vagues et soleil levant
out(
  "public/brand/hero-2.svg",
  svg(
    1290,
    610,
    defs("g", P.deep, P.ink, 90) +
      `<rect width="1290" height="610" fill="url(#g)"/>` +
      `<circle cx="960" cy="330" r="170" fill="${P.brass}" opacity=".35"/><circle cx="960" cy="330" r="110" fill="${P.brassLight}" opacity=".45"/>` +
      wave(360, 40, P.teal, 0.55) + wave(430, 34, P.deep, 0.7) + wave(500, 30, P.ink, 0.8) + wave(565, 20, P.deep, 0.9),
  ),
);

// --- À propos : arches et feuilles (affiché dans une carte arrondie sur le fond de page)
out(
  "public/brand/about.svg",
  svg(
    500,
    477,
    `<rect width="500" height="477" fill="${P.mist}"/>` +
      `<circle cx="360" cy="120" r="64" fill="${P.brass}" opacity=".55"/>` +
      `<path d="M70 477 V250 a90 90 0 0 1 180 0 V477 Z" fill="${P.deep}"/>` +
      `<path d="M270 477 V300 a70 70 0 0 1 140 0 V477 Z" fill="${P.teal}"/>` +
      `<path d="M110 477 V260 a50 50 0 0 1 100 0 V477 Z" fill="${P.ivory}" opacity=".9"/>` +
      leaf(250, 477, 170, -80, P.deep, 0.9) + leaf(262, 477, 130, -58, P.brass, 0.9) + leaf(420, 477, 150, -108, P.teal, 0.9),
  ),
);

// --- Étapes du parcours (rognées en cercle dans l'interface)
out(
  "public/brand/process-2.svg",
  svg(
    200,
    200,
    `<rect width="200" height="200" fill="${P.mist}"/>` +
      `<circle cx="100" cy="100" r="64" fill="none" stroke="${P.deep}" stroke-width="10"/>` +
      `<circle cx="100" cy="100" r="34" fill="${P.brass}"/>` +
      `<circle cx="100" cy="100" r="86" fill="none" stroke="${P.teal}" stroke-width="3" opacity=".5"/>`,
  ),
);
out(
  "public/brand/process-3.svg",
  svg(
    200,
    200,
    `<rect width="200" height="200" fill="${P.sand}"/>` +
      leaf(100, 160, 110, -90, P.deep) + leaf(100, 160, 90, -50, P.teal) + leaf(100, 160, 90, -130, P.brass) +
      `<rect x="96" y="150" width="8" height="34" rx="4" fill="${P.deep}"/>`,
  ),
);

// --- Carte cadeau et motif décoratif
out(
  "public/brand/gift.svg",
  svg(
    500,
    250,
    defs("g", P.deep, P.ink, 30) +
      `<rect width="500" height="250" rx="22" fill="url(#g)"/>` +
      `<rect x="14" y="14" width="472" height="222" rx="14" fill="none" stroke="${P.brass}" stroke-opacity=".6"/>` +
      `<rect x="228" y="0" width="44" height="250" fill="${P.brass}" opacity=".85"/><rect x="0" y="103" width="500" height="44" fill="${P.brass}" opacity=".85"/>` +
      `<circle cx="250" cy="125" r="30" fill="${P.brassLight}"/>`,
  ),
);
out(
  "public/brand/decor.svg",
  svg(193, 158, leaf(20, 140, 150, -60, P.deep, 0.9) + leaf(40, 140, 120, -30, P.teal, 0.9) + leaf(60, 142, 100, -85, P.brass, 0.9)),
);

// --- Icônes : favicon (app/icon.svg) et icônes d'application (réservées à la future PWA, RUN-13)
const mark = (size, radius, pad) => {
  const c = size / 2;
  const r = c - pad;
  return (
    `<rect width="${size}" height="${size}" rx="${radius}" fill="${P.deep}"/>` +
    `<circle cx="${c}" cy="${c}" r="${r * 0.62}" fill="none" stroke="${P.ivory}" stroke-width="${size * 0.09}"/>` +
    `<path d="M${c - r * 0.62} ${c} A ${r * 0.62} ${r * 0.62} 0 0 1 ${c + r * 0.62} ${c}" fill="none" stroke="${P.brass}" stroke-width="${size * 0.09}" stroke-linecap="round"/>`
  );
};
const icon = (size, radius, pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><title>OVAGLOW</title>${mark(size, radius, pad)}</svg>`;
out("src/app/icon.svg", icon(64, 14, 4));
out("public/brand/icon.svg", icon(512, 112, 32));
out("public/brand/icon-maskable.svg", icon(512, 0, 96));
