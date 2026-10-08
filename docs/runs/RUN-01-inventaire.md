# RUN-01 — Inventaire de `mahaza-demo@656cfc7`

Légende : **(a)** générique à garder · **(b)** contenu ou médias Mahaza à exclure · **(c)** legacy St Louis à exclure · **(d)** build / infra / tests à garder.
Règle appliquée en cas de doute : exclure le contenu de marque, garder le mécanisme.

La classification est produite par règles (script d'import) sur les **139 fichiers suivis par Git** de `main`.

| Classe | Fichiers |
|---|---:|
| (a) générique | 80 |
| (b) contenu / médias Mahaza | 12 |
| (c) legacy St Louis | 28 |
| (d) build / infra / tests | 19 |
| **Total** | **139** |

## (d) Build, infra, tests — 19 fichiers, gardés

| Fichiers | Traitement |
|---|---|
| `package.json`, `package-lock.json` | Renommés (`ovatech-spa-core`), scripts ajoutés ; dépendances montées à l'étape 7 |
| `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.mts` | Gardés |
| `next.config.ts`, `tailwind.config.ts` | Gardés ; aiguillages `NEXT_PUBLIC_THEME` retirés à l'étape 4 |
| `Dockerfile`, `.dockerignore`, `.gitignore` | Gardés ; `ARG NEXT_PUBLIC_THEME` retiré (étape 4), `HEALTHCHECK` ajouté (étape 8) |
| `.env.example` | Gardé, réécrit (`APP_ENV` à la place de `NEXT_PUBLIC_THEME`) |
| `scripts/check-contrast.mjs` | Gardé, étendu aux tokens clair et sombre (étape 5) |
| `tests/mahaza/{exports,kpis,lifecycle,scheduling,seed}.test.ts`, `tests/mahaza/fixtures.ts` | Gardés (45 tests) ; identifiants de sites et noms de marque remplacés par ceux d'OVAGLOW |

## (b) Contenu et médias Mahaza — 12 fichiers, exclus

| Fichier | Pourquoi | Remplacement dans la souche |
|---|---|---|
| `public/mahaza/{logo,app-icon,hero-1,hero-2,about,gift,flower,process-2,process-3}.png` (9 médias, 2,2 Mo avec `robots.txt` exclu) | Médias de la marque Mahaza | Wordmark texte + illustrations SVG générées |
| `theme.config.ts` | Mécanisme **et** contenu réel : contact, réseaux sociaux, textes d'accueil, horaires, palette, thème St Louis | `brand.config.ts` + tokens + `copy` (marque FICTIVE) ; la **forme** `ThemeConfig` est conservée |
| `data/mahaza.ts` | Noms réels des 5 sites et catalogue réel de l'ancien site ; praticiens, salles et réservations seed FICTIFS | Jeu de données OVAGLOW FICTIF ; le **générateur** par site est conservé |
| `README.md` | Décrit la démo Mahaza / St Louis | README de la souche |

Hors arbre `main` : `docs/refonte-1-cadrage.md` et `docs/README.md` n'existent que sur la branche `claude/vibrant-feynman-ndb0h5` de `mahaza-demo`.
Lus pour le contexte, **jamais copiés**.

## (c) Legacy St Louis — 28 fichiers, exclus

| Fichiers | Rôle |
|---|---|
| `data/stlouis.ts` (1) | Catalogue, barbiers, salles, réservations seed St Louis |
| `lib/store.tsx` (1) | Store mémoire du rendu legacy |
| `components/booking/*` (9) | Tunnel de réservation legacy |
| `components/admin/*` (8) | Back-office legacy |
| `components/ui/*` (7 : badge, button, card, dialog, input, label, switch) | Primitives du rendu legacy (le rendu premium a les siennes dans `components/mahaza/ui/`) |
| `components/site-header.tsx`, `components/site-footer.tsx` (2) | En-tête / pied de page legacy |

Ces 28 fichiers ne sont **pas copiés** à l'étape 3. Les imports qui les visaient dans des fichiers gardés sont traités à l'étape 4 (voir ci-dessous).

### Dépendances croisées gardé → legacy

| Fichier gardé | Importe | Traitement (étape 4) |
|---|---|---|
| `components/fictive-badge.tsx` | `components/ui/badge` | Réécrit avec la primitive premium `components/mahaza/ui/pill` |
| `app/layout.tsx` | `lib/store` (legacy) et `theme.id` | Seul le provider premium reste |
| `app/page.tsx`, `app/reserver/page.tsx` | `site-header`, `site-footer`, `ui/*`, `booking/*` | Seul le rendu premium reste |
| `app/admin/{layout,page,reservations,salles,staff}` | `components/admin/*`, `ui/badge` | Seul le rendu premium reste |

## (a) Générique — 80 fichiers, gardés

| Chemin | Fichiers | Contenu | Notes |
|---|---:|---|---|
| `app/` | 12 | Layout, styles, accueil, réservation, sonde de santé, favicon, 7 pages d'admin | Aiguillages `theme.id` retirés (étape 4) |
| `components/mahaza/admin/` | 11 | Tableau de bord, planning, réservations, clients, salles, équipe, dialogue de réservation, coque | Générique ; renommé en `src/ui/admin` (étape 6) |
| `components/mahaza/booking/` | 12 | Tunnel multi-soins : spa, soins, praticien, créneau, acompte, confirmation, compte à rebours, modifier / annuler | Idem → `src/ui/booking` |
| `components/mahaza/home/` | 3 | Accueil, carrousel, cartes cadeaux | Textes de marque réécrits (étape 5) |
| `components/mahaza/ui/` | 8 | Bouton, carte, dialogue, champ, pastille, titre de section, squelette, interrupteur | → `src/ui/primitives` |
| `components/mahaza/{site-header,site-footer}.tsx` | 2 | En-tête, pied de page | Textes de marque réécrits |
| `components/{brand-logo,fictive-badge}.tsx` | 2 | Logo (repli texte), badge FICTIF | Réécrits (voir dépendances) |
| `lib/{dates,utils,availability,sites,whatsapp}.ts` | 5 | Dates (fuseau `Africa/Douala`), formatage FCFA, créneaux, sites, liens `wa.me` | Aiguillage `theme.id` de `whatsapp.ts` retiré |
| `lib/mahaza/` | 21 | Panier, conflits, CSV, ICS, KPI, cycle de vie, fidélité, planification, seed, store, états, police et CSS premium | `root-class.ts` (aiguillage de thème) supprimé ; → `src/core/*` |
| `data/{types,mahaza-demo}.ts` | 2 | Types ; générateur de clients et d'historique FICTIFS | Mécanisme gardé, renommé (étape 6) |
| `public/robots.txt` | 1 | `noindex` | Gardé |

Les identifiants et chaînes « Mahaza » restant dans ces fichiers (noms de composants, `data-theme="mahaza"`, textes de pied de page, cartes cadeaux)
sont des **références de marque dans du code générique** : ils sont supprimés aux étapes 5 et 6 et l'anti-fuite (`npm run check:brand`) le prouve.
Aucun contenu réel Mahaza (noms de sites, catalogue, contact, réseaux sociaux, médias) n'entre dans le dépôt, y compris dans l'historique.
