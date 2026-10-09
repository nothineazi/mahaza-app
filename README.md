# ovatech-spa-core — souche OVAGLOW

Souche **privée** d'un logiciel de gestion d'institut de beauté et de barbershop (réservation, agenda, clients, catalogue, équipe, WhatsApp, notifications ; caisse, fidélité, stock, RH et rapports ensuite).

- **Marque de démonstration : OVAGLOW** — fictive. Sites, soins, prix, personnes et numéros sont **FICTIFS** et marqués comme tels à l'écran.
- La souche sert de base à deux dépôts clients créés depuis un tag (`core-vX.Y`). Elle n'est **jamais déployée** : la CI construit l'image et vérifie `/api/health`.
- Aujourd'hui (RUN-P) : front de démonstration, sans base de données ni authentification ; l'état est conservé dans l'onglet du navigateur (`sessionStorage`, bouton « Réinitialiser la démo » dans le back-office). Le backend arrive au RUN-A (plan allégé, `docs/PLAN.md` §5).
- Les deux apps clientes (dépôts privés distincts) sont créées depuis le tag `demo-v0.1` **avec l'historique** et reçoivent les évolutions du socle par `git merge upstream/main` (ADR-045).

> Lire d'abord `CLAUDE.md`, puis `docs/STANDARDS.md`, `docs/PLAN.md` et `docs/DECISIONS.md`.

## Prérequis

| Outil | Version | Remarque |
|---|---|---|
| Node.js | 24 (voir `.nvmrc`) | Windows : <https://nodejs.org> (installeur LTS 24) ou `nvm-windows` |
| npm | fourni avec Node | |
| Git | récent | |
| Docker Desktop | optionnel | pour construire et démarrer l'image |

## Commandes (PowerShell)

```powershell
# Installer
npm ci

# Lancer en développement (http://localhost:3000)
$env:APP_ENV = "development"
npm run dev

# Vérifier (types, lint, tests, contrastes, anti-fuite de marque, garde-fou design)
npm run verify

# Garde-fou design seul (back-office) ; --strict échoue s'il reste une violation (mode de la CI)
npm run check:design -- --strict

# Tableau des contrastes WCAG des deux thèmes
npm run check:contrast -- --markdown

# Tests unitaires seuls
npm test

# Tests e2e (smoke à 375 et 1280 px) : build puis navigateur
npx playwright install chromium
npm run build
npm run e2e

# Construire puis démarrer le build de production (http://localhost:3000)
npm run build
npm start

# Mesurer le First Load JS de chaque route (après npm run build)
npm run measure:first-load

# Image Docker
docker build -t ovatech-spa-core .
docker run --rm -p 3000:3000 -e APP_ENV=staging ovatech-spa-core
Invoke-WebRequest http://localhost:3000/api/health   # StatusCode 200
```

Sous Linux ou macOS, remplacer `$env:APP_ENV = "development"` par `export APP_ENV=development`.

### Environnement d'exécution

| Variable | Valeurs | Effet |
|---|---|---|
| `APP_ENV` | `development` (défaut), `staging`, `production` | Hors `production` : bandeau « Version de développement – données fictives » et liens WhatsApp sans destinataire (`https://wa.me/?text=…`). Lue à l'exécution (voir ADR-025). |
| `PORT`, `HOSTNAME` | `3000`, `0.0.0.0` | Serveur de production |

Aucun secret n'est nécessaire à ce stade. `.env*` est ignoré par Git ; `.env.example` documente les variables.

## Scripts npm

| Script | Rôle |
|---|---|
| `dev`, `build`, `start` | Next.js ; `start` copie les ressources statiques puis lance le serveur autonome |
| `typecheck`, `lint`, `test` | TypeScript, ESLint (flat config), Vitest |
| `verify` | `typecheck` + `lint` + `test` + `check:contrast` + `check:brand` + `check:design --strict` |
| `check:contrast` | Contrastes WCAG AA des thèmes clair et sombre, calculés en OKLCH (`src/brand/theme/tokens.css`) ; `-- --markdown` pour le tableau |
| `check:design` | Garde-fou du design system du back-office (`src/ui/kv`, `src/ui/admin`, `src/app/(app)/admin`) ; `-- --strict` échoue à la moindre violation (mode CI) ; exception : commentaire `check-design-allow(<motif>): <raison>` |
| `check:brand` | Anti-fuite : aucune occurrence des noms de `src/brand/forbidden-names.json` (marques des autres dépôts) |
| `assets:generate` | Régénère les illustrations SVG (`public/brand/`) et le favicon |
| `measure:first-load` | First Load JS (gzip) par route ; `-- --budget scripts/first-load-budget.json` pour le contrôle CI (149 / 172 kB) |
| `e2e` | Playwright (375 et 1280 px) sur le build de production ; les noms viennent de la marque active (`e2e/brand-data.ts`) |

## Structure

```
src/
  app/     routes Next : accueil, (app)/ = /reserver et /admin/* (seules routes qui chargent le store), /api/health
  core/    SOCLE : booking, clients, sites, whatsapp, state, lib, types — jamais modifié dans un dépôt client
  brand/   MARQUE : brand.config.ts, theme/ (tokens OKLCH, polices), fonts/ (polices auto-hébergées + licences OFL), copy/, seed/ — seul dossier modifié par un dépôt client
  ui/      composants partagés : primitives, site, home, booking (site public) ; kv/ (design system du back-office) ; admin/
public/    robots.txt, public/brand/ (illustrations SVG)
e2e/       tests Playwright
scripts/   contrôles et utilitaires
docs/      plan, standards, ADR, sécurité, rapports de run
```

Détails et règles : `docs/ARCHITECTURE.md`. Design : `docs/reference/factory-core.md` et ADR-035 à 040 (`docs/DECISIONS.md`).

### Thème clair / sombre

Le thème suit le système par défaut ; le bouton du back-office (barre latérale, en-tête mobile) bascule clair / sombre et mémorise le choix dans le navigateur (classe `.dark` sur `<html>`, `next-themes`).

## Créer une app cliente et recevoir le socle

Une app cliente ne modifie que `src/brand/` (marque, thème, polices, vocabulaire `copy/vocab.ts`, seed, `copy/home.ts`), `public/brand/`, les métadonnées (`src/app/icon.svg`, nom) et la liste `src/brand/forbidden-names.json` (noms interdits par l'anti-fuite, lue par `scripts/check-brand-leak.mjs` et par l'e2e). En cas de conflit de merge sur `README.md`, `CHANGELOG.md` ou `package.json`, garder la version de l'app. `src/core` et `src/ui` restent intacts : `git diff upstream/main -- src/core src/ui` doit rester vide. Les tests du socle utilisent un jeu de données figé (`tests/core/fixture-brand/`, ADR-044) et l'e2e lit les noms dans la marque (`e2e/brand-data.ts`), donc la CI est identique.

```powershell
git remote add upstream https://github.com/nothineazi/ovatech-spa-core.git
git fetch upstream --tags
git checkout -b run/merge-socle
git merge upstream/main          # après chaque évolution du socle (core-vX.Y ou main)
npm ci ; npm run verify          # puis PR vers main
```

## Règles non négociables (extrait)

Aucun secret dans le dépôt · aucune donnée inventée présentée comme réelle · pas de compte client · pas de glisser-déposer · français uniquement · l'application n'encaisse rien · jamais de push direct sur `main` (une branche et une PR par run).
