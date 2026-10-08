# ovatech-spa-core — souche OVAGLOW

Souche **privée** d'un logiciel de gestion d'institut de beauté et de barbershop (réservation, agenda, clients, catalogue, équipe, WhatsApp, notifications ; caisse, fidélité, stock, RH et rapports ensuite).

- **Marque de démonstration : OVAGLOW** — fictive. Sites, soins, prix, personnes et numéros sont **FICTIFS** et marqués comme tels à l'écran.
- La souche sert de base à deux dépôts clients créés depuis un tag (`core-vX.Y`). Elle n'est **jamais déployée** : la CI construit l'image et vérifie `/api/health`.
- Aujourd'hui (RUN-01) : front en mémoire, sans base de données ni authentification. Le backend arrive à partir du RUN-02 (voir `docs/PLAN.md`).

> Lire d'abord `CLAUDE.md`, puis `docs/STANDARDS.md`, `docs/PLAN.md` et `docs/DECISIONS.md`.

## Prérequis

| Outil | Version | Remarque |
|---|---|---|
| Node.js | 22 (voir `.nvmrc`) | Windows : <https://nodejs.org> (installeur LTS 22) ou `nvm-windows` |
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

# Vérifier (types, lint, tests, contrastes, anti-fuite de marque)
npm run verify

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
| `verify` | `typecheck` + `lint` + `test` + `check:contrast` + `check:brand` |
| `check:contrast` | Contrastes WCAG AA des thèmes clair et sombre (`src/brand/theme/tokens.css`) |
| `check:brand` | Anti-fuite : aucune référence aux marques des dépôts clients |
| `assets:generate` | Régénère les illustrations SVG (`public/brand/`) et le favicon |
| `measure:first-load` | First Load JS (gzip) par route |
| `e2e` | Playwright (375 et 1280 px) sur le build de production |

## Structure

```
src/
  app/     routes Next (accueil, /reserver, /admin/*, /api/health)
  core/    SOCLE : booking, clients, sites, whatsapp, state, lib, types — jamais modifié dans un dépôt client
  brand/   MARQUE : brand.config.ts, theme/ (tokens, polices), copy/, seed/ — seul dossier modifié par un dépôt client
  ui/      composants partagés (primitives, site, home, booking, admin)
public/    robots.txt, public/brand/ (illustrations SVG)
e2e/       tests Playwright
scripts/   contrôles et utilitaires
docs/      plan, standards, ADR, sécurité, rapports de run
```

Détails et règles : `docs/ARCHITECTURE.md`.

## Règles non négociables (extrait)

Aucun secret dans le dépôt · aucune donnée inventée présentée comme réelle · pas de compte client · pas de glisser-déposer · français uniquement · l'application n'encaisse rien · jamais de push direct sur `main` (une branche et une PR par run).
