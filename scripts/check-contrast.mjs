#!/usr/bin/env node
// Vérifie les contrastes WCAG 2.x AA (texte ≥ 4,5:1 ; composants d'interface ≥ 3:1) des couples de couleurs réellement
// utilisés par l'interface, pour le thème clair ET le thème sombre définis dans src/brand/theme/tokens.css.
// Usage : node scripts/check-contrast.mjs   (code de sortie 1 si un couple est sous le seuil)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/brand/theme/tokens.css"), "utf8");

const TOKENS = [
  "background", "foreground", "card", "primary", "primary-foreground", "secondary", "secondary-foreground", "muted", "muted-foreground",
  "accent", "accent-foreground", "border", "success", "success-foreground", "destructive", "inverse", "inverse-foreground",
];

/** Extrait les jetons « --nom: R G B; » d'un bloc dont l'ouverture correspond au sélecteur. */
function block(selector) {
  const start = css.indexOf(selector);
  if (start < 0) throw new Error(`Bloc introuvable : ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const body = css.slice(open + 1, close);
  const out = {};
  for (const m of body.matchAll(/--([a-z-]+):\s*(\d+) (\d+) (\d+);/g)) out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  return out;
}

const light = block(":root {");
const darkMedia = block(':root:not([data-theme="light"]) {');
const darkAttr = block(':root[data-theme="dark"] {');

let bad = 0;
for (const name of TOKENS) {
  for (const [label, set] of [["clair", light], ["sombre (media)", darkMedia], ["sombre (attribut)", darkAttr]]) {
    if (!set[name]) { console.log(`FAIL jeton manquant : --${name} (${label})`); bad++; }
  }
  if (JSON.stringify(darkMedia[name]) !== JSON.stringify(darkAttr[name])) { console.log(`FAIL blocs sombres divergents : --${name}`); bad++; }
}

const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (fg, bg, a) => fg.map((v, i) => v * a + bg[i] * (1 - a));
const lum = (c) => {
  const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const WHITE = [255, 255, 255];
const HERO_OVERLAY_MIN = 0.88;

function pairsFor(C) {
  // Voile du hero (src/ui/home/hero-carousel.tsx : inverse/92 → inverse/88) sur un visuel blanc : pire cas, côté le plus clair.
  const hero = mix(C.inverse, WHITE, HERO_OVERLAY_MIN);
  // [libellé, premier plan, arrière-plan, seuil]
  return [
    ["Texte courant sur fond", C.foreground, C.background, 4.5],
    ["Texte sur carte", C.foreground, C.card, 4.5],
    ["Texte sur secondaire", C.foreground, C.secondary, 4.5],
    ["Texte secondaire-foreground sur secondaire", C["secondary-foreground"], C.secondary, 4.5],
    ["Texte secondaire-foreground sur secondaire/50 (sélection)", C["secondary-foreground"], mix(C.secondary, C.background, 0.5), 4.5],
    ["Texte atténué sur fond", C["muted-foreground"], C.background, 4.5],
    ["Texte atténué sur carte", C["muted-foreground"], C.card, 4.5],
    ["Texte atténué sur muted", C["muted-foreground"], C.muted, 4.5],
    ["Texte atténué sur secondaire", C["muted-foreground"], C.secondary, 4.5],
    ["Texte atténué sur fond admin (muted/40)", C["muted-foreground"], mix(C.muted, C.background, 0.4), 4.5],
    ["Texte atténué sur muted/60", C["muted-foreground"], mix(C.muted, C.background, 0.6), 4.5],
    ["Primaire (liens, titres) sur fond", C.primary, C.background, 4.5],
    ["Primaire sur carte", C.primary, C.card, 4.5],
    ["Primaire sur secondaire", C.primary, C.secondary, 4.5],
    ["Primaire sur muted/40 (admin)", C.primary, mix(C.muted, C.background, 0.4), 4.5],
    ["Bouton primaire (primary-foreground sur primaire)", C["primary-foreground"], C.primary, 4.5],
    ["Bouton primaire au survol (primaire/90)", C["primary-foreground"], mix(C.primary, C.background, 0.9), 4.5],
    ["Bouton or (texte sur accent)", C["accent-foreground"], C.accent, 4.5],
    ["Bouton or au survol (accent/90)", C["accent-foreground"], mix(C.accent, C.background, 0.9), 4.5],
    ["Pastille « en attente » (texte sur accent/25 sur carte)", C.foreground, mix(C.accent, C.card, 0.25), 4.5],
    ["Texte atténué sur bloc planning en attente", C["muted-foreground"], mix(C.accent, C.card, 0.25), 4.5],
    ["Succès sur carte", C.success, C.card, 4.5],
    ["Succès sur succès/12 (pastille)", C.success, mix(C.success, C.card, 0.12), 4.5],
    ["Succès sur succès/10 (notice)", C.success, mix(C.success, C.background, 0.1), 4.5],
    ["Bouton WhatsApp (success-foreground sur succès)", C["success-foreground"], C.success, 4.5],
    ["Bouton WhatsApp au survol (succès/90)", C["success-foreground"], mix(C.success, C.background, 0.9), 4.5],
    ["Texte sur bloc planning confirmé (succès/15)", C.foreground, mix(C.success, C.card, 0.15), 4.5],
    ["Texte atténué sur bloc confirmé", C["muted-foreground"], mix(C.success, C.card, 0.15), 4.5],
    ["Destructif sur carte", C.destructive, C.card, 4.5],
    ["Destructif sur destructif/10", C.destructive, mix(C.destructive, C.card, 0.1), 4.5],
    ["Destructif sur destructif/5", C.destructive, mix(C.destructive, C.background, 0.05), 4.5],
    ["Texte sur bloc no-show (destructif/10)", C.foreground, mix(C.destructive, C.card, 0.1), 4.5],
    ["Compte à rebours : texte sur secondaire", C.foreground, C.secondary, 4.5],
    // Surfaces inversées : pied de page, hero, carte cadeau, infobulle, lien d'évitement
    ["Surface inversée : texte", C["inverse-foreground"], C.inverse, 4.5],
    ["Surface inversée : texte/90", mix(C["inverse-foreground"], C.inverse, 0.9), C.inverse, 4.5],
    ["Surface inversée : texte/85", mix(C["inverse-foreground"], C.inverse, 0.85), C.inverse, 4.5],
    ["Surface inversée : texte/80", mix(C["inverse-foreground"], C.inverse, 0.8), C.inverse, 4.5],
    ["Surface inversée : texte/75", mix(C["inverse-foreground"], C.inverse, 0.75), C.inverse, 4.5],
    ["Surface inversée : texte/70", mix(C["inverse-foreground"], C.inverse, 0.7), C.inverse, 4.5],
    ["Surface inversée : accent (liens, kicker)", C.accent, C.inverse, 4.5],
    ["Hero : texte/90 sur voile inversé/88, visuel blanc (pire cas)", mix(C["inverse-foreground"], hero, 0.9), hero, 4.5],
    ["Hero : accent sur voile inversé/88, visuel blanc (pire cas)", C.accent, hero, 4.5],
    // Composants d'interface (WCAG 1.4.11, ≥ 3:1)
    ["Bordure des champs (foreground/55) sur carte", mix(C.foreground, C.card, 0.55), C.card, 3],
    ["Piste d'interrupteur éteinte (muted-foreground/70) sur carte", mix(C["muted-foreground"], C.card, 0.7), C.card, 3],
    ["Anneau de focus (primaire) sur fond", C.primary, C.background, 3],
    ["Anneau de focus (primaire) sur carte", C.primary, C.card, 3],
    ["Anneau de focus (accent) sur surface inversée", C.accent, C.inverse, 3],
    ["Barre de progression (primaire) sur piste (border)", C.primary, C.border, 3],
  ];
}

const summary = [];
for (const [name, C] of [["clair", light], ["sombre", darkAttr]]) {
  console.log(`\n== Thème ${name} ==`);
  const pairs = pairsFor(C);
  for (const [label, fg, bgc, thr] of pairs) {
    const r = ratio(fg, bgc);
    const ok = r >= thr;
    if (!ok) bad++;
    console.log(`${ok ? "OK  " : "FAIL"} ${r.toFixed(2).padStart(5)}:1 (≥ ${thr})  ${label}  [${hex(fg)} / ${hex(bgc)}]`);
  }
  summary.push(`${name} : ${pairs.length} couples`);
}
console.log(bad ? `\n${bad} échec(s)` : `\nTous les couples respectent le seuil WCAG AA (${summary.join(" · ")})`);
process.exit(bad ? 1 : 0);
