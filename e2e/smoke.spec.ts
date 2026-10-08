import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { BRAND_LEAK, adminNav, expectNoHorizontalScroll, expectNoSeriousA11yViolations, layoutShiftScore } from "./helpers";

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
    // Thème par défaut = thème du système : next-themes pose la classe `.dark` sur <html>.
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
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

test.describe("chargement différé (poids du premier chargement)", () => {
  test("accueil : le studio de cartes cadeaux n'est chargé qu'à l'approche de la section", async ({ page }) => {
    await page.goto("/");
    // Titre et texte rendus par le serveur ; le formulaire n'existe pas encore (son code n'est pas téléchargé).
    await expect(page.locator("#cartes-cadeaux").getByRole("heading", { level: 2 })).toBeVisible();
    await expect(page.getByRole("button", { name: /Générer ma carte cadeau/ })).toHaveCount(0);
    await page.locator("#cartes-cadeaux").scrollIntoViewIfNeeded();
    const generate = page.getByRole("button", { name: /Générer ma carte cadeau/ });
    await expect(generate).toBeVisible();
    await page.getByRole("button", { name: /^10 000 FCFA$/ }).first().click();
    await generate.click();
    await expect(page.getByText(/GC-[A-Z0-9]{4}-[A-Z0-9]{4}/).first()).toBeVisible();
    await expect(page.getByText("FICTIF – ne pas payer").first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("réservation : récapitulatif détaillé (feuille mobile) ouvert à la demande", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1280) >= 1024, "la barre du panier n'existe que sous 1024 px");
    await page.goto("/reserver");
    await page.getByRole("button", { name: /Site Aurore/ }).click();
    await page.getByRole("button", { name: /Soin Lumière/ }).first().click();
    await page.getByRole("button", { name: /Voir le récapitulatif|1 soin/ }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Votre réservation" })).toBeVisible();
    await expect(dialog.getByText("Soin Lumière").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

test.describe("back-office", () => {
  test("tableau de bord, planning, réservations (export CSV), clients, salles, équipe", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { level: 1, name: "Tableau de bord" })).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: BANNER })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);

    await (await adminNav(page)).getByRole("link", { name: "Planning" }).click();
    await expect(page).toHaveURL(/\/admin\/planning$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoHorizontalScroll(page);

    await (await adminNav(page)).getByRole("link", { name: "Réservations" }).click();
    await expect(page).toHaveURL(/\/admin\/reservations$/);
    await expectNoHorizontalScroll(page);
    const [csv] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Exporter en CSV/ }).click()]);
    const content = await readFile((await csv.path())!, "utf8");
    expect(content.charCodeAt(0)).toBe(0xfeff); // BOM UTF-8
    expect(content).toContain("Référence;Statut;Date");
    expect(content).toContain("FICTIF");

    await (await adminNav(page)).getByRole("link", { name: "Clients" }).click();
    await expect(page).toHaveURL(/\/admin\/clients$/);
    await expectNoHorizontalScroll(page);

    await (await adminNav(page)).getByRole("link", { name: "Salles" }).click();
    await expect(page).toHaveURL(/\/admin\/salles$/);
    await expectNoHorizontalScroll(page);

    await (await adminNav(page)).getByRole("link", { name: "Staff" }).click();
    await expect(page).toHaveURL(/\/admin\/staff$/);
    await expectNoHorizontalScroll(page);
    await expect(page.locator("body")).not.toContainText(BRAND_LEAK);
  });
});

test.describe("back-office : fiches et formulaires", () => {
  test("réservation : confirmer un acompte depuis la fiche (action primaire), Échap referme", async ({ page }) => {
    await page.goto("/admin/reservations");
    await page.getByRole("button", { name: /^En attente d'acompte/ }).click();
    const mobile = (page.viewportSize()?.width ?? 1280) < 640;
    const first = mobile ? page.getByRole("list", { name: "Liste des réservations" }).getByRole("button").first() : page.getByRole("row").filter({ hasText: "En attente d'acompte" }).first();
    await first.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expectNoSeriousA11yViolations(page);
    // Statut « en attente d'acompte » : la primaire est « Acompte reçu : confirmer » ; l'annulation est dans le menu « Autres actions ».
    await expect(dialog.getByRole("button", { name: "Annuler la réservation" })).toHaveCount(0);
    await dialog.getByRole("button", { name: "Acompte reçu : confirmer" }).click();
    await expect(dialog.getByText("Statut mis à jour : Acompte reçu : confirmer.")).toBeVisible();
    await dialog.getByRole("button", { name: "Autres actions" }).click();
    await expect(dialog.getByRole("menuitem", { name: "Annuler la réservation" })).toBeVisible();
    await page.keyboard.press("Escape"); // referme le menu seulement
    await expect(dialog.getByRole("menu")).toBeHidden();
    await page.waitForTimeout(600); // laisse passer l'animation de fermeture d'une fiche qui se fermerait à tort
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expectNoHorizontalScroll(page);
  });

  test("salles : ajouter une salle par le formulaire (Entrée valide, destructif absent d'une nouvelle fiche)", async ({ page }) => {
    await page.goto("/admin/salles");
    await page.getByRole("button", { name: "Ajouter une salle" }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Nouvelle salle" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Autres actions" })).toHaveCount(0);
    await expect(dialog.getByRole("button", { name: "Enregistrer" })).toBeDisabled();
    await dialog.getByLabel(/^Nom/).fill("Salle de test e2e");
    await dialog.getByRole("checkbox").first().check();
    await expectNoSeriousA11yViolations(page);
    await dialog.getByLabel(/^Nom/).press("Enter");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: "Modifier Salle de test e2e" })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});

test.describe("back-office : accessibilité (axe) de chaque écran, en clair et en sombre", () => {
  for (const scheme of ["light", "dark"] as const) {
    test(`les six écrans, thème ${scheme === "light" ? "clair" : "sombre"}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      for (const path of ["/admin", "/admin/planning", "/admin/reservations", "/admin/clients", "/admin/salles", "/admin/staff"]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.locator("html")).toHaveClass(scheme === "dark" ? /(^|\s)dark(\s|$)/ : /^((?!dark).)*$/);
        await expectNoSeriousA11yViolations(page);
      }
    });
  }
});

test.describe("thème clair / sombre", () => {
  test("le bouton du back-office bascule le thème et le choix est mémorisé", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/admin");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/(^|\s)dark(\s|$)/);
    const toggle = page.getByRole("button", { name: "Basculer entre le thème clair et le thème sombre" }).and(page.locator(":visible"));
    await toggle.first().click();
    await expect(html).toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(html).toHaveCSS("color-scheme", "dark");
    await expectNoSeriousA11yViolations(page);
    await page.reload();
    await expect(html).toHaveClass(/(^|\s)dark(\s|$)/);
    await page.getByRole("button", { name: "Basculer entre le thème clair et le thème sombre" }).and(page.locator(":visible")).first().click();
    await expect(html).not.toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(html).toHaveCSS("color-scheme", "light");
  });
});

test("sonde de santé", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ status: "ok" });
});
