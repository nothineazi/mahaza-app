#!/usr/bin/env node
// Vérifie les contrastes WCAG 2.x AA (texte ≥ 4,5:1 ; composants d'interface ≥ 3:1) des couples de couleurs réellement
// utilisés par l'interface, pour le thème clair ET le thème sombre définis dans src/brand/theme/tokens.css.
//
// Méthode (docs/reference/factory-core.md §9) : OKLCH → sRGB linéaire → luminance relative (WCAG) ; les couleurs semi-transparentes
// sont composées sur la surface réelle avant le calcul ; un jeton hors de la gamme sRGB fait échouer le contrôle (rendu non prévisible).
//
// Usage : node scripts/check-contrast.mjs [--markdown]   (code de sortie 1 si un couple est sous le seuil)
//   --markdown : sortie en tableau Markdown (clair | sombre), utilisée pour l'ADR du RUN-01b.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/brand/theme/tokens.css"), "utf8");
const markdown = process.argv.includes("--markdown");

// ---------- Lecture des jetons ----------

/** Extrait les déclarations « --nom: valeur; » du bloc dont le sélecteur ouvre à `selector` (premier bloc après le commentaire d'en-tête). */
function block(selector) {
  const start = css.search(new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{`, "m"));
  if (start < 0) throw new Error(`Bloc introuvable : ${selector}`);
  const open = css.indexOf("{", start);
  const close = css.indexOf("\n}", open);
  const out = {};
  for (const m of css.slice(open + 1, close).matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const lightRaw = block(":root");
const darkRaw = { ...lightRaw, ...block(".dark") };

/** Résout var(--x) et les alias, puis analyse oklch(L C H [/ A]). */
function resolve(raw, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`Alias circulaire : ${name}`);
  let v = raw[name];
  if (v === undefined) throw new Error(`Jeton manquant : --${name}`);
  seen.add(name);
  v = v.replace(/var\(--([a-z0-9-]+)\)/g, (_, n) => (n === "brand-h" ? raw["brand-h"] : resolveRaw(raw, n, seen)));
  return v;
}
function resolveRaw(raw, name, seen) {
  return resolve(raw, name, new Set(seen));
}

function parseColor(raw, name) {
  const v = resolve(raw, name);
  const m = v.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?))?\s*\)$/);
  if (!m) throw new Error(`Valeur non reconnue pour --${name} : ${v}`);
  const alpha = m[4] === undefined ? 1 : m[5] ? Number(m[4]) / 100 : Number(m[4]);
  return { ...oklchToSrgb(Number(m[1]), Number(m[2]), Number(m[3])), alpha, name };
}

// ---------- Conversion de couleur ----------

function oklchToSrgb(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const outOfGamut = lin.some((v) => v < -0.0005 || v > 1.0005);
  const enc = (v) => {
    const c = Math.min(1, Math.max(0, v));
    return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  };
  return { rgb: lin.map(enc), outOfGamut };
}

const hex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (fg, bg, a) => fg.map((v, i) => v * a + bg[i] * (1 - a));
const lum = (c) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// ---------- Couples vérifiés ----------

const WHITE = [255, 255, 255];
const HERO_OVERLAY_MIN = 0.88;

function pairsFor(raw, themeName) {
  const tokens = {};
  const names = Object.keys(raw).filter((n) => n !== "brand-h");
  for (const n of names) tokens[n] = parseColor(raw, n);
  const gamut = names.filter((n) => tokens[n].outOfGamut);

  const T = new Proxy({}, { get: (_, n) => tokens[n].rgb });
  /** Jeton (éventuellement translucide) composé sur une surface, avec une opacité de classe supplémentaire (`/70`). */
  const over = (name, surface, a = 1) => mix(tokens[name].rgb, surface, tokens[name].alpha * a);
  const tint = (name, surface, a) => mix(T[name], surface, a);
  const T4 = 4.5;
  const T3 = 3;
  const dark = themeName === "sombre";
  const hero = mix(T.inverse, WHITE, HERO_OVERLAY_MIN);
  const surf = { bg: T.background, card: T.card, muted: T.muted, side: T.sidebar };

  // [groupe, libellé, premier plan, arrière-plan, seuil]
  const pairs = [
    ["Socle", "Texte courant sur fond", T.foreground, surf.bg, T4],
    ["Socle", "Texte sur carte", T["card-foreground"], surf.card, T4],
    ["Socle", "Texte sur menu / dialogue (popover)", T["popover-foreground"], T.popover, T4],
    ["Socle", "Texte sur muted", T.foreground, surf.muted, T4],
    ["Socle", "Texte atténué sur fond", T["muted-foreground"], surf.bg, T4],
    ["Socle", "Texte atténué sur carte", T["muted-foreground"], surf.card, T4],
    ["Socle", "Texte atténué sur muted", T["muted-foreground"], surf.muted, T4],
    ["Socle", "Texte atténué sur secondaire", T["muted-foreground"], T.secondary, T4],
    ["Socle", "Texte secondaire-foreground sur secondaire", T["secondary-foreground"], T.secondary, T4],
    ["Socle", "Texte accent-foreground sur accent (survol)", T["accent-foreground"], T.accent, T4],
    ["Socle", "Bouton primaire (primary-foreground sur primary)", T["primary-foreground"], T.primary, T4],
    ["Socle", "Bouton primaire au survol (primary/90)", T["primary-foreground"], tint("primary", surf.bg, 0.9), T4],
    ["Socle", "Accent en texte (primary-text) sur carte", T["primary-text"], surf.card, T4],
    ["Socle", "Accent en texte sur fond", T["primary-text"], surf.bg, T4],
    ["Socle", "Accent en texte sur info-bg (pastille)", T["primary-text"], T["info-bg"], T4],
    ["Socle", "Accent en texte sur secondaire", T["primary-text"], T.secondary, T4],
    ["Socle", "Destructif en texte sur carte", T.destructive, surf.card, T4],
    ["Socle", "Destructif en texte sur danger-bg", T.destructive, T["danger-bg"], T4],
    ["Socle", "Succès en texte sur carte", T.success, surf.card, T4],
    ["Socle", "Succès en texte sur fond", T.success, surf.bg, T4],
    ["Socle", "Avertissement en texte sur carte", T.warning, surf.card, T4],
    ["Socle", "Bordure de carte sur fond (non-texte)", over("border", surf.bg), surf.bg, dark ? 1.3 : T3],
    ["Socle", "Bordure de carte sur carte (non-texte)", over("border", surf.card), surf.card, dark ? 1.3 : T3],
    ["Socle", "Bordure de champ (input) sur carte (WCAG 1.4.11)", over("input", surf.card), surf.card, T3],
    ["Socle", "Bordure de champ (input) sur fond (WCAG 1.4.11)", over("input", surf.bg), surf.bg, T3],
    ["Socle", "Anneau de focus (ring) sur fond", T.ring, surf.bg, T3],
    ["Socle", "Anneau de focus (ring) sur carte", T.ring, surf.card, T3],
    ["Socle", "Anneau de focus (ring) sur coque (sidebar)", T.ring, surf.side, T3],
    ["Socle", "Icône d'accent (primary) sur carte (non-texte)", T.primary, surf.card, T3],
    // Coque du back-office
    ["Coque", "Texte de la coque (sidebar-foreground sur sidebar)", T["sidebar-foreground"], surf.side, T4],
    ["Coque", "Texte atténué (élément de navigation inactif) sur sidebar", T["muted-foreground"], surf.side, T4],
    ["Coque", "Élément actif (sidebar-accent-foreground sur sidebar-accent)", T["sidebar-accent-foreground"], T["sidebar-accent"], T4],
    ["Coque", "Élément de navigation au survol (texte sur sidebar-accent/60)", T["sidebar-foreground"], tint("sidebar-accent", surf.side, 0.6), T4],
    ["Coque", "Accent en texte sur sidebar", T["primary-text"], surf.side, T4],
    ["Coque", "Filet de la coque (sidebar-border) sur sidebar (décoratif)", over("sidebar-border", surf.side), surf.side, 1.05],
    // Statuts de réservation (badge : fg sur bg ; bloc de planning : texte sur bg)
    ...["pending", "confirmed", "completed", "cancelled", "noshow"].flatMap((s) => [
      ["Statuts", `Badge « ${s} » (fg sur bg)`, T[`status-${s}-fg`], T[`status-${s}-bg`], T4],
      ["Statuts", `Bloc de planning « ${s} » : texte courant sur bg`, T.foreground, T[`status-${s}-bg`], T4],
      ["Statuts", `Bloc de planning « ${s} » : texte atténué sur bg`, T["muted-foreground"], T[`status-${s}-bg`], T4],
      ["Statuts", `Liseré de statut « ${s} » sur carte (non-texte)`, T[`status-${s}-fg`], surf.card, T3],
    ]),
    // Registre éditorial du site public
    ["Public", "Texte sur secondaire (compte à rebours, sélection)", T.foreground, T.secondary, T4],
    ["Public", "Texte sur secondaire/50 (sélection)", T["secondary-foreground"], tint("secondary", surf.bg, 0.5), T4],
    ["Public", "Texte atténué sur muted/60", T["muted-foreground"], tint("muted", surf.bg, 0.6), T4],
    ["Public", "Texte atténué sur muted/40", T["muted-foreground"], tint("muted", surf.bg, 0.4), T4],
    ["Public", "Primaire (liens, titres) sur secondaire", T.primary, T.secondary, T4],
    ["Public", "Bouton or (gold-foreground sur gold)", T["gold-foreground"], T.gold, T4],
    ["Public", "Bouton or au survol (gold/90)", T["gold-foreground"], tint("gold", surf.bg, 0.9), T4],
    ["Public", "Pastille « en attente » : texte sur gold/25 sur carte", T.foreground, tint("gold", surf.card, 0.25), T4],
    ["Public", "Bouton WhatsApp (success-foreground sur success)", T["success-foreground"], T.success, T4],
    ["Public", "Bouton WhatsApp au survol (success/90)", T["success-foreground"], tint("success", surf.bg, 0.9), T4],
    ["Public", "Succès sur success/10 (notice)", T.success, tint("success", surf.bg, 0.1), T4],
    ["Public", "Destructif sur destructif/10", T.destructive, tint("destructive", surf.card, 0.1), T4],
    ["Public", "Destructif sur destructif/5", T.destructive, tint("destructive", surf.bg, 0.05), T4],
    ["Public", "Surface inversée : texte", T["inverse-foreground"], T.inverse, T4],
    ...[90, 85, 80, 75, 70].map((p) => ["Public", `Surface inversée : texte/${p}`, tint("inverse-foreground", T.inverse, p / 100), T.inverse, T4]),
    ["Public", "Surface inversée : or (liens, kicker)", T.gold, T.inverse, T4],
    ["Public", "Hero : texte/90 sur voile inversé/88, visuel blanc (pire cas)", mix(T["inverse-foreground"], hero, 0.9), hero, T4],
    ["Public", "Hero : or sur voile inversé/88, visuel blanc (pire cas)", T.gold, hero, T4],
    ["Public", "Piste d'interrupteur éteinte (muted-foreground/70) sur carte", tint("muted-foreground", surf.card, 0.7), surf.card, T3],
    ["Public", "Barre de progression (primary) sur piste (line)", T.primary, over("line", surf.card), dark ? 3 : T3],
    ["Public", "Anneau de focus (or) sur surface inversée", T.gold, T.inverse, T3],
  ];
  return { pairs, gamut, tokens };
}

// ---------- Exécution ----------

let bad = 0;
const results = {};
for (const [name, raw] of [["clair", lightRaw], ["sombre", darkRaw]]) {
  const { pairs, gamut } = pairsFor(raw, name);
  if (gamut.length) {
    for (const n of gamut) console.log(`FAIL hors gamme sRGB (${name}) : --${n}`);
    bad += gamut.length;
  }
  results[name] = pairs.map(([group, label, fg, bg, thr]) => {
    const r = ratio(fg, bg);
    const ok = r >= thr;
    if (!ok) bad++;
    return { group, label, r, thr, ok, fg: hex(fg), bg: hex(bg) };
  });
}

if (markdown) {
  console.log("| Groupe | Couple | Seuil | Clair | Sombre |");
  console.log("|---|---|---:|---:|---:|");
  results.clair.forEach((c, i) => {
    const d = results.sombre[i];
    console.log(`| ${c.group} | ${c.label} | ${c.thr} | ${c.r.toFixed(2)} ${c.ok ? "✅" : "❌"} | ${d.r.toFixed(2)} ${d.ok ? "✅" : "❌"} |`);
  });
} else {
  for (const name of ["clair", "sombre"]) {
    console.log(`\n== Thème ${name} ==`);
    for (const c of results[name]) console.log(`${c.ok ? "OK  " : "FAIL"} ${c.r.toFixed(2).padStart(5)}:1 (≥ ${c.thr})  ${c.label}  [${c.fg} / ${c.bg}]`);
  }
}
const count = results.clair.length;
console.log(bad ? `\n${bad} échec(s)` : `\nTous les couples respectent le seuil WCAG AA (clair : ${count} couples · sombre : ${results.sombre.length} couples)`);
process.exit(bad ? 1 : 0);
