import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { BRAND_LEAK, expectNoHorizontalScroll, expectNoSeriousA11yViolations, layoutShiftScore } from "./helpers";

const BANNER = "Version de développement – données fictives";

test.describe("accueil", () => {
  test("affiche la marque fictive, le bandeau et reste stable", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenue chez OVAGLOW" })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: BANNER })).toBeVisible();
    await expect(page.getByRole("link", { name: "Prendre rendez-vous" }).first()).toBeVisible();
    await expect(page.locator("body")).not.toContainText(BRAND_LEAK);
    await expectNoHorizontalScroll(page);
    expect(await layoutShiftScore(page)).toBeLessThan(0.02);
  });

  test("catalogue FICTIF, sites et pied de page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Nos services" })).toBeVisible();
    await expect(page.getByText("Prix en FCFA, FICTIFS")).toBeVisible();
    await expect(page.locator("#sites").getByRole("heading", { name: "Nos sites" })).toBeVisible();
    await expect(page.getByText("Marque fictive de démonstration. Aucune réservation")).toBeVisible();
  });

  test("accessibilité (axe) en clair et en sombre", async ({ page }) => {
    // Mouvement réduit : pas de fondu du carrousel pendant l'analyse (contrastes calculés sur des couleurs stables).
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expectNoSeriousA11yViolations(page);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(14, 21, 21)");
    await expectNoSeriousA11yViolations(page);
  });
});

test.describe("réservation multi-soins", () => {
  test("du choix du site à la confirmation (.ics, WhatsApp sans destinataire, compte à rebours)", async ({ page }) => {
    await page.goto("/reserver");
    await expect(page.getByRole("status").filter({ hasText: BANNER })).toBeVisible();

    // 1. Site
    await page.getByRole("button", { name: /Site Aurore/ }).click();
    // 2. Deux soins dans le panier
    await expect(page.getByRole("heading", { level: 1, name: "Composez votre moment" })).toBeVisible();
    await page.getByRole("button", { name: /Soin Lumière/ }).first().click();
    await page.getByRole("button", { name: /Manucure complète/ }).first().click();
    await page.getByRole("button", { name: "Continuer" }).click();
    // 3. Praticien : « sans préférence » par défaut
    await expect(page.getByRole("heading", { level: 1, name: "Votre praticien" })).toBeVisible();
    await page.getByRole("button", { name: "Choisir le créneau" }).click();
    // 4. Créneau
    await expect(page.getByRole("heading", { level: 1, name: "Choisissez votre créneau" })).toBeVisible();
    await page.locator('section[aria-labelledby="slot-day"] button:not([disabled])').first().click();
    await page.locator('section[aria-labelledby="slot-time"] button').first().click();
    await expect(page.getByRole("heading", { name: "Votre enchaînement" })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.getByRole("button", { name: "Continuer vers l'acompte" }).click();
    // 5. Acompte & coordonnées : numéro fictif signalé
    await expect(page.getByRole("heading", { level: 1, name: "Acompte & coordonnées" })).toBeVisible();
    await expect(page.getByText("FICTIF – ne pas payer").first()).toBeVisible();
    await page.getByLabel("Nom complet").fill("Cliente Test");
    await page.getByLabel(/Téléphone/).fill("6 12 34 56 78");
    await expectNoHorizontalScroll(page);
    await page.getByRole("button", { name: "Confirmer ma réservation" }).click();
    // 6. Confirmation
    await expect(page.getByRole("heading", { level: 1, name: "Votre réservation" })).toBeVisible();
    await expect(page.getByText(/OVG-\d{4}/).first()).toBeVisible();
    await expect(page.getByText("Soin Lumière").first()).toBeVisible();
    await expect(page.getByText("Manucure complète").first()).toBeVisible();
    // En-dehors de la production, le lien WhatsApp n'a pas de destinataire.
    const wa = page.getByRole("link", { name: /Envoyer la confirmation sur WhatsApp/ });
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/\?text=/);
    const href = (await wa.getAttribute("href")) ?? "";
    expect(decodeURIComponent(href)).toContain("FICTIF – ne pas payer");
    // .ics
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Ajouter au calendrier" }).click()]);
    expect(download.suggestedFilename()).toMatch(/^rdv-OVG-\d{4}\.ics$/);
    const ics = await readFile((await download.path())!, "utf8");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:[DÉMO] OVAGLOW");
    // Simulation de la confirmation du site
    await page.getByRole("button", { name: "Simuler la confirmation du salon" }).click();
    await expect(page.getByText("Confirmée").first()).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });
});

test.describe("back-office", () => {
  test("tableau de bord, planning, réservations (export CSV), clients, salles, équipe", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { level: 1, name: "Tableau de bord" })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: BANNER })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);

    const nav = page.getByRole("navigation", { name: "Navigation du back-office" });

    await nav.getByRole("link", { name: "Planning" }).click();
    await expect(page).toHaveURL(/\/admin\/planning$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await nav.getByRole("link", { name: "Réservations" }).click();
    await expect(page).toHaveURL(/\/admin\/reservations$/);
    await expectNoHorizontalScroll(page);
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Exporter en CSV/ }).click()]);
    const content = await readFile((await csv.path())!, "utf8");
    expect(content.charCodeAt(0)).toBe(0xfeff); // BOM UTF-8
    expect(content).toContain("Référence;Statut;Date");
    expect(content).toContain("FICTIF");

    await nav.getByRole("link", { name: "Clients" }).click();
    await expect(page).toHaveURL(/\/admin\/clients$/);
    await expectNoHorizontalScroll(page);

    await nav.getByRole("link", { name: "Salles" }).click();
    await expect(page).toHaveURL(/\/admin\/salles$/);
    await expectNoHorizontalScroll(page);

    await nav.getByRole("link", { name: "Staff" }).click();
    await expect(page).toHaveURL(/\/admin\/staff$/);
    await expectNoHorizontalScroll(page);
    await expect(page.locator("body")).not.toContainText(BRAND_LEAK);
  });
});

test("sonde de santé", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ status: "ok" });
});
