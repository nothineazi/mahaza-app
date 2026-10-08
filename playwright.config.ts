import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

// Smoke e2e sur le build de production (serveur autonome), à 375 px (mobile) et 1280 px (bureau).
// PW_CHROMIUM_PATH : chemin d'un Chromium déjà installé (sandbox de l'agent) ; sinon `npx playwright install chromium`.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    locale: "fr-FR",
    timezoneId: "Africa/Douala",
    trace: "retain-on-failure",
    launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {},
  },
  projects: [
    { name: "mobile-375", use: { viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true } },
    { name: "bureau-1280", use: { viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: "node scripts/start-standalone.mjs",
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: { PORT: String(PORT), HOSTNAME: "127.0.0.1", APP_ENV: "development" },
  },
});
