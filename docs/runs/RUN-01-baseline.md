# RUN-01 — Base de référence (mahaza-demo)

> Mesurée le 2026-10-08 sur un clone en lecture seule de `nothineazi/mahaza-demo`, branche `main`, commit `656cfc7`
> (`656cfc778a45074e3a30e3c7501607c0c16be67b`). Aucune modification n'a été faite dans ce clone (seuls `node_modules/` et `.next/`, ignorés par Git, ont été produits).
> Sandbox de l'agent : Linux, Node v22.22.0, npm 10.9.4.

## Versions

| Composant | Version |
|---|---|
| Next.js | 15.5.27 |
| React / React DOM | 19.3.0 |
| Tailwind CSS | 3.4.19 |
| TypeScript | 5.9.3 |
| Vitest | 5.0.3 |
| ESLint | 9.39.5 |
| PostCSS | 8.5.29 |
| lucide-react | 1.52.0 |
| Node (mesure) | v22.22.0 (aucun `.nvmrc` dans la démo) |

## Résultats

| Contrôle | Résultat |
|---|---|
| `npm ci` | OK |
| Tests (`vitest run`) | **45 / 45** verts, 5 fichiers, ≈ 0,8 s |
| Lint (`eslint .`) | 0 erreur |
| Typecheck (`tsc --noEmit`) | 0 erreur |
| `next build` | OK, 12 pages générées |
| `scripts/check-contrast.mjs` | 49 couples, tous ≥ seuil WCAG AA |
| `npm audit` | 12 vulnérabilités (4 modérées, 8 élevées) ; 10 en `--omit=dev` (4 modérées, 6 élevées). Sources : `postcss` (copie embarquée par `next`), `postcss-selector-parser` via `postcss-nested` (outillage Tailwind) |

## Routes et First Load JS (`next build`, Next 15.5.27)

| Route | Type | Taille | First Load JS |
|---|---|---:|---:|
| `/` | statique | 8,38 kB | **142 kB** |
| `/_not-found` | statique | 996 B | 104 kB |
| `/admin` | statique | 10,6 kB | 156 kB |
| `/admin/clients` | statique | 4,17 kB | 150 kB |
| `/admin/planning` | statique | 3,93 kB | 150 kB |
| `/admin/reservations` | statique | 7,86 kB | 154 kB |
| `/admin/salles` | statique | 5,09 kB | 149 kB |
| `/admin/staff` | statique | 5,24 kB | 149 kB |
| `/api/health` | dynamique | 127 B | 103 kB |
| `/icon.svg` | statique | 127 B | 103 kB |
| `/reserver` | statique | 16,9 kB | **168 kB** |
| **Partagé par toutes les routes** | | | **103 kB** (46,5 + 54,2 + 1,93 kB) |

**Budget** (STANDARDS §7) : les routes publiques sont `/` (142 kB) et `/reserver` (168 kB). Elles ne doivent pas dépasser ces valeurs
(la démo les citait « 141–168 kB »).

## Structure de la démo

- `app/` : `page.tsx` (accueil), `reserver/`, `admin/{,clients,planning,reservations,salles,staff}`, `api/health`, `icon.svg`.
- Deux rendus coexistent, choisis au build par `NEXT_PUBLIC_THEME` : **Mahaza premium** (`components/mahaza/**`, `lib/mahaza/**`) et **St Louis legacy**
  (`components/{booking,admin,ui}`, `data/stlouis.ts`, `lib/store.tsx`).
- Données en mémoire React (aucune base). Pas de `middleware.ts`. Pas de `docs/` sur `main`.

## Écart constaté

- `docs/refonte-1-cadrage.md` n'est **pas** sur `main` de `mahaza-demo` : il se trouve sur la branche
  `claude/vibrant-feynman-ndb0h5`. Il a été lu depuis cette branche (lecture seule). Il ne figure pas dans la souche (document de cadrage de Mahaza, voir inventaire).
