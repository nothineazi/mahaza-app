# ARCHITECTURE — ovatech-spa-core

État au **RUN-01** : application Next.js 16 sans backend. Tout l'état vit en mémoire dans le navigateur (store React). La cible (PostgreSQL, authentification, autorisation, jobs) est décrite dans `docs/STANDARDS.md` et `docs/PLAN.md` ; ce document décrit ce qui existe et les règles qui s'appliquent déjà.

## 1. Structure

```
src/
  app/                       routes Next (App Router)
    layout.tsx               racine : APP_ENV, bandeau, provider, jetons CSS
    page.tsx                 accueil
    reserver/page.tsx        tunnel de réservation
    admin/…                  tableau de bord, planning, réservations, clients, salles, staff
    api/health/route.ts      sonde de santé → 200 {"status":"ok"}
    icon.svg, globals.css
  core/                      SOCLE (jamais modifié dans un dépôt client)
    booking/                 scheduling, conflicts, holds, lifecycle, status, cart, availability, kpis, seed, gift-card
    clients/                 loyalty, phone
    sites/                   sites (multi-site, site par défaut)
    whatsapp/                whatsapp (liens wa.me), messages, reminders
    state/                   store.tsx (état en mémoire, transitoire)
    lib/                     dates (Africa/Douala), utils (FCFA), runtime (APP_ENV), csv, ics, download, use-now
    types.ts                 types du domaine et BrandConfig
  brand/                     MARQUE (seul dossier modifié par un dépôt client)
    brand.config.ts          nom, contact, horaires, fonctionnalités, politiques par défaut, numéros FICTIFS
    theme/                   tokens.css (clair / sombre), fonts.ts, effects.css
    copy/home.ts             contenu éditorial de l'accueil
    seed/                    catalog.ts (sites, soins, praticiens, salles, réservations), demo.ts (clients, historique)
  ui/                        composants partagés
    primitives/              bouton, carte, dialogue, champ, pastille, titre, squelette, interrupteur
    site/                    en-tête et pied de page publics
    home/                    accueil, carrousel, cartes cadeaux
    booking/                 tunnel multi-soins (site → soins → praticien → créneau → acompte → confirmation)
    admin/                   coque, navigation, tableau de bord, planning, réservations, clients, salles, staff
public/                      robots.txt, brand/ (illustrations et icônes SVG)
e2e/                         Playwright
scripts/                     contrôles (contrastes, anti-fuite, budget), génération d'assets, démarrage autonome
```

## 2. Règles `core` / `brand`

1. **`src/core/**` ne contient aucun contenu de marque** : ni nom, ni texte, ni couleur, ni donnée. Il lit la marque **uniquement** via `import { brand } from "@/brand/brand.config"`.
2. **`src/brand/**` est le seul dossier qu'un dépôt client remplace.** Les exports attendus (`brand`, `seedSites`, `seedCategories`, `seedServices`, `seedPractitioners`, `seedRooms`, `seedBookings`, `demoClients`, `demoReservations`, `homeCopy`, `displayFont`, `tokens.css`) forment le contrat entre le socle et la marque.
3. Une personnalisation qui exige de toucher `src/core/` est une **évolution du socle** : elle se fait dans la souche, puis est mergée dans les apps (`git merge upstream/main`). Contrôle côté app : `git diff upstream/main -- src/core` doit être vide.
4. Les composants de `src/ui/**` lisent aussi `brand` ; ils ne contiennent aucun nom de marque.
5. **Anti-fuite** : `npm run check:brand` (et la CI) échoue si « Mahaza » ou « St Louis » apparaît hors `docs/` et `CLAUDE.md` (ADR-026).
6. Aucune donnée non fournie par le client n'est présentée comme réelle : tout est FICTIF (badge `FictiveBadge`, bandeau, mentions « FICTIF »).

## 3. Flux de code souche → apps

```
ovatech-spa-core (souche, jamais déployée)
   │  tag core-vX.Y
   ├──► mahaza-app   (dépôt à historique propre, remote `upstream` = souche, src/brand/ propre)
   └──► stlouis-app  (idem)
```

Les évolutions du socle circulent dans un seul sens : souche → tag → `git merge upstream/main` dans chaque app. Les apps n'ont aucun droit de modification sur `src/core/`.

## 4. Exécution

- **Rendu** : toutes les pages sont rendues à la demande (le layout appelle `connection()` pour lire `APP_ENV` à chaque requête). Les pages sont des composants serveur qui montent des composants client.
- **Environnement** (`src/core/lib/runtime.ts`) : `APP_ENV` ∈ {`development`, `staging`, `production`}, défaut `development`. `RuntimeProvider` transmet la valeur aux composants client (`useRuntime()`), qui construisent les liens WhatsApp sans destinataire hors production.
- **Thème** (`src/brand/theme/tokens.css`) : jetons en canaux RGB (`--primary: 31 91 94`), utilisés par Tailwind via `rgb(var(--x) / <alpha>)`. Clair par défaut ; sombre selon le système ou par `data-theme="dark"`. Les surfaces toujours sombres (pied de page, hero, carte cadeau) utilisent `inverse` / `inverse-foreground`.
- **Police** : Cormorant Garamond (titres) via `next/font/google`, variable `--font-display`.
- **Temps** : stocké en UTC dans la cible ; affichage `Africa/Douala` (`src/core/lib/dates.ts`). **Montants** : FCFA entiers (`formatPrice`).
- **Planification** : les fonctions de `src/core/booking/` sont pures (contexte passé en paramètre) et couvertes par les tests unitaires : créneaux, enchaînement multi-soins, conflits praticien / salle, cycle de vie, expiration d'acompte.
- **Store** (`src/core/state/store.tsx`) : état de la démo en mémoire, **transitoire** (ADR-030). Il sera remplacé par des services serveur adossés à PostgreSQL ; les fonctions pures de `core/booking/` en seront le moteur.

## 5. Build, image, CI

- `next build` → `output: "standalone"` ; `npm start` copie `public/` et `.next/static/` puis lance `server.js`.
- `Dockerfile` en trois étapes (`deps`, `builder`, `runner`), `node:22-alpine`, utilisateur non-root, `HEALTHCHECK` sur `/api/health`. Fonctionne avec un système de fichiers en lecture seule.
- `.github/workflows/ci.yml` : `verify` (typecheck, lint, tests, contrastes, anti-fuite, build, budget), `e2e` (Playwright 375 et 1280 px), `docker` (build, démarrage, `/api/health`).

## 6. Tests

| Niveau | Outil | Contenu |
|---|---|---|
| Unitaires | Vitest (`tests/core/`) | planification, conflits, cycle de vie, KPI, seed, exports (ICS, CSV), WhatsApp, `APP_ENV` — 49 tests |
| Contrastes | `scripts/check-contrast.mjs` | 48 couples × 2 thèmes |
| Anti-fuite | `scripts/check-brand-leak.mjs` | marques des dépôts clients |
| E2E | Playwright + axe (`e2e/`) | 6 scénarios × 2 largeurs |
| Poids | `scripts/measure-first-load.mjs` | First Load JS gzip par route, budget en CI |

## 7. Ce qui n'existe pas encore

Base de données, authentification, autorisation, audit, jobs, SSE, PWA, en-têtes de sécurité (CSP), sauvegardes : voir `docs/PLAN.md` (RUN-02 à RUN-13). `/admin` n'est protégé par rien (voir `docs/SECURITY.md`).
