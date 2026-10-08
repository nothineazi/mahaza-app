import localFont from "next/font/local";

/*
 * Polices auto-hébergées (aucun service de polices n'est contacté au build ni à l'exécution) : licences OFL, voir
 * src/brand/fonts/README.md. Les variables `--font-face-*` sont posées sur <html> ; les rôles `--font-sans`,
 * `--font-display` et `--font-mono` (src/app/globals.css) pointent vers elles, jamais vers eux-mêmes.
 * Repli ajusté (`adjustFontFallback`) : pas de décalage de mise en page au chargement.
 */

/** Corps de texte et interface : Inter variable, sous-ensemble latin (accents français compris). */
export const sansFont = localFont({
  src: [{ path: "../fonts/inter/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-face-sans",
  display: "swap",
  adjustFontFallback: "Arial",
});

/** Affichage : wordmark et titres. Serif éditoriale du site public, aussi utilisée pour les titres d'écran du back-office. */
export const displayFont = localFont({
  src: [
    { path: "../fonts/cormorant-garamond/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-garamond/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-face-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

/** Références et code : jamais préchargée (utilisée dans le back-office seulement), téléchargée à la première utilisation. */
export const monoFont = localFont({
  src: [{ path: "../fonts/jetbrains-mono/jetbrains-mono-latin-wght-normal.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-face-mono",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

/** Classes des trois variables, à poser sur <html>. */
export const fontVariables = `${sansFont.variable} ${displayFont.variable} ${monoFont.variable}`;
