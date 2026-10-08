import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Aucun défilement horizontal de la page (STANDARDS §8 : « aucun défilement horizontal de page à 375 px »). */
export async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(scrollWidth, `largeur de défilement ${scrollWidth} > fenêtre ${innerWidth}`).toBeLessThanOrEqual(innerWidth);
}

/** Cumul des décalages de mise en page (CLS) observés depuis le chargement, hors interaction utilisateur. */
export async function layoutShiftScore(page: Page): Promise<number> {
  return page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!entry.hadRecentInput) total += entry.value;
        });
        observer.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(total);
        }, 800);
      }),
  );
}

/** axe-core : aucune violation « sérieuse » ou « critique » (WCAG 2.x A/AA). */
export async function expectNoSeriousA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id} (${v.impact}) : ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`)).toEqual([]);
}

/** Noms des marques des dépôts clients : ne doivent jamais apparaître à l'écran (motif assemblé pour ne pas se signaler lui-même dans l'anti-fuite). */
export const BRAND_LEAK = new RegExp([["maha", "za"].join(""), ["st\\s?lo", "uis"].join("")].join("|"), "i");
