import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Sens des jetons (ADR-036) : `accent` est la surface teintée discrète de la factory (et non le laiton, devenu `gold`) ;
 * `border` est le filet fort (≥ 3:1) du back-office (le site public utilise `line`). Un renommage manqué ne produit aucune erreur
 * mais la mauvaise couleur : ce test échoue si le site public emploie encore l'ancien sens.
 */
const PUBLIC_DIRS = ["src/ui/home", "src/ui/booking", "src/ui/site", "src/ui/primitives"];
const PUBLIC_FILES = ["src/ui/brand-logo.tsx", "src/ui/env-banner.tsx", "src/ui/fictive-badge.tsx"];
const OLD_MEANING = /(?<![\w-])(?:[a-z-]+:)*(?:bg|text|border|ring|from|via|to|fill|stroke|outline|divide|decoration)-(?:accent(?:-foreground)?|border)(?![\w-])/;

describe("sens des jetons dans le site public", () => {
  it("aucun `*-accent` (laiton) ni `*-border` (filet décoratif) hérité de l'ancien nommage", () => {
    const files = [
      ...PUBLIC_DIRS.flatMap((d) => readdirSync(d, { recursive: true, encoding: "utf8" }).map((f) => join(d, f))),
      ...PUBLIC_FILES,
    ].filter((f) => /\.tsx?$/.test(f) && statSync(f).isFile());
    const hits = files.flatMap((f) => readFileSync(f, "utf8").split("\n").map((l, i) => (OLD_MEANING.test(l) ? `${f}:${i + 1}` : "")).filter(Boolean));
    expect(hits).toEqual([]);
  });
});
