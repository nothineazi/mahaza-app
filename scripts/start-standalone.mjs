#!/usr/bin/env node
// Démarre le serveur autonome de `next build` (output: "standalone") en recopiant d'abord les ressources statiques
// que Next ne copie pas lui-même (public/ et .next/static/). Multiplateforme (Windows / Linux / macOS).
// Variables : PORT (défaut 3000), HOSTNAME (défaut 0.0.0.0), APP_ENV.
import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
if (!existsSync(join(standalone, "server.js"))) {
  console.error("Build introuvable : lancez d'abord `npm run build`.");
  process.exit(1);
}
cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });
cpSync(join(root, ".next", "static"), join(standalone, ".next", "static"), { recursive: true });

const child = spawn(process.execPath, ["server.js"], {
  cwd: standalone,
  stdio: "inherit",
  env: { ...process.env, PORT: process.env.PORT ?? "3000", HOSTNAME: process.env.HOSTNAME ?? "0.0.0.0" },
});
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
child.on("exit", (code) => process.exit(code ?? 0));
