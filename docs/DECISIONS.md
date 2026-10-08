# DECISIONS — ovatech-spa-core

Registre des décisions d'architecture (ADR). Format : contexte, décision, alternatives, conséquences, statut.

**Statuts** : `ACCEPTÉ` (validé par Yass) · `À VALIDER` (choix pris par l'agent par prudence, à confirmer ou à inverser) · `REMPLACÉ`.
**Règle** : toute dérogation à `docs/STANDARDS.md` ou toute montée de version majeure passe par une ADR validée par Yass.

## Index

| ADR | Titre | Statut |
|---|---|---|
| 001 | Vrai produit avec backend, données FICTIVES en staging | ACCEPTÉ |
| 002 | Next.js 16 (migration au RUN-01) | ACCEPTÉ |
| 003 | Trois dépôts : souche privée + deux apps clientes | ACCEPTÉ |
| 004 | Souche sans historique de `mahaza-demo` | ACCEPTÉ |
| 005 | Souche jamais déployée (CI seule) | ACCEPTÉ |
| 006 | PostgreSQL auto-hébergé, une base par app | ACCEPTÉ |
| 007 | Drizzle ORM | ACCEPTÉ |
| 008 | Better Auth (authentification) + autorisation maison | ACCEPTÉ |
| 009 | Rôles et permissions en code, affectations par site en base | ACCEPTÉ |
| 010 | RLS + couche d'accès unique + tests IDOR | ACCEPTÉ |
| 011 | pg-boss + process worker | ACCEPTÉ |
| 012 | SSE avec repli polling | ACCEPTÉ |
| 013 | WhatsApp niveau N1 (liens `wa.me`) | ACCEPTÉ |
| 014 | Acompte manuel validé par ID de transaction | ACCEPTÉ |
| 015 | Pas d'e-mail en v1 | ACCEPTÉ |
| 016 | PWA native (manifest + `sw.js` maison) | ACCEPTÉ |
| 017 | Staging en `http://IP:PORT` | ACCEPTÉ |
| 018 | Images construites en CI (GHCR), jamais sur le KVM | ACCEPTÉ |
| 019 | Node.js 22 | **À VALIDER** (passage à Node 24 proposé) |
| 020 | Next.js 16.4.0 | ACCEPTÉ (version exacte : à confirmer) |
| 021 | React 19.3.0 | ACCEPTÉ |
| 022 | Tailwind CSS 3.4.19 maintenu | ACCEPTÉ |
| 023 | Playwright et axe-core en dépendances de développement | **À VALIDER** |
| 024 | Budget de First Load JS sous Next 16 | **À VALIDER** |
| 025 | `APP_ENV` à l'exécution, rendu dynamique, liens WhatsApp sans destinataire hors production | **À VALIDER** |
| 026 | Périmètre de l'anti-fuite de marque | **À VALIDER** |
| 027 | Thèmes clair et sombre, surfaces inversées | **À VALIDER** |
| 028 | Illustrations SVG générées, servies depuis `public/brand/` | **À VALIDER** |
| 029 | Jeu de données FICTIF d'OVAGLOW | **À VALIDER** |
| 030 | Store en mémoire transitoire conservé | **À VALIDER** |
| 031 | Textes non encore centralisés par module | **À VALIDER** |
| 032 | Cartes cadeaux conservées comme simulation FICTIVE | **À VALIDER** |
| 033 | Jobs e2e et Docker dans la CI du RUN-01 | **À VALIDER** |
| 034 | Turbopack par défaut | **À VALIDER** |

---

## Décisions du plan (`docs/PLAN.md` §1)

Ces dix-huit décisions ont été validées par Yass le 2026-10-08 (PLAN v1.0). Elles sont reprises ici pour être référencées par les runs suivants.

### ADR-001 — Vrai produit avec backend, données FICTIVES en staging
- **Contexte** : la démo `mahaza-demo` est un simulateur en mémoire. Le contrat prévoit un logiciel de gestion réel, et l'outil doit aussi convaincre le réseau d'instituts.
- **Décision** : construire un vrai produit avec backend ; en staging, toutes les données sont FICTIVES.
- **Alternatives** : démo simulée jetable.
- **Conséquences** : un seul code, crédible ; chaque donnée non fournie est marquée FICTIF (`STANDARDS.md` §9).
- **Statut** : ACCEPTÉ.

### ADR-002 — Next.js 16 (migration au RUN-01)
- **Contexte** : Next 15 sort de la maintenance le 21/10/2026.
- **Décision** : migrer vers Next 16 dès le RUN-01. Exception actée au gel des versions majeures (CLAUDE.md §4).
- **Alternatives** : rester en Next 15.
- **Conséquences** : voir ADR-020 (version), ADR-024 (poids), ADR-034 (Turbopack).
- **Statut** : ACCEPTÉ.

### ADR-003 — Trois dépôts : souche privée + deux apps clientes
- **Contexte** : cession du code spécifique à chaque institut à terme ; souche réutilisable pour le réseau.
- **Décision** : `ovatech-spa-core` (souche), `mahaza-app` et `stlouis-app` créés depuis un tag de la souche ; `mahaza-demo` figé puis archivé.
- **Alternatives** : monorepo ; deux copies sans souche.
- **Conséquences** : une évolution du socle se fait dans la souche, puis `git merge upstream/main` dans chaque app ; les apps ne modifient jamais `src/core/`.
- **Statut** : ACCEPTÉ.

### ADR-004 — Souche sans historique de `mahaza-demo`
- **Contexte** : aucun média ni contenu Mahaza ne doit entrer dans la souche.
- **Décision** : import propre, en un commit, de l'arbre nettoyé (voir `docs/runs/RUN-01-inventaire.md`).
- **Alternatives** : fork avec historique.
- **Conséquences** : le contenu réel (noms de sites, catalogue, médias) n'est présent à aucun moment dans l'historique de la souche.
- **Statut** : ACCEPTÉ.

### ADR-005 — Souche jamais déployée (CI seule)
- **Décision** : la souche n'est exécutée qu'en CI ; elle ne tourne ni sur le KVM ni ailleurs.
- **Alternatives** : instance de démo OVAGLOW.
- **Conséquences** : économie du KVM partagé ; l'image Docker de la souche ne sert qu'à vérifier le build et `/api/health`.
- **Statut** : ACCEPTÉ.

### ADR-006 — PostgreSQL auto-hébergé, une base par app
- **Contexte** : isolation, portabilité vers le VPS client, données de santé.
- **Décision** : PostgreSQL auto-hébergé, une base par app, jamais publié sur un port de l'hôte.
- **Alternatives écartées** : Supabase Free (pause après 7 jours, pas de sauvegarde, mélange avec d'autres projets) ; Neon.
- **Statut** : ACCEPTÉ (mise en œuvre au RUN-02).

### ADR-007 — Drizzle ORM
- **Décision** : Drizzle + drizzle-kit ; SQL brut pour `EXCLUDE`, RLS et `GRANT`.
- **Alternatives** : Prisma.
- **Statut** : ACCEPTÉ (RUN-02).

### ADR-008 — Better Auth (authentification) + autorisation maison
- **Décision** : Better Auth pour l'authentification seule (nom d'utilisateur + TOTP) ; autorisation maison, indépendante de la bibliothèque.
- **Alternatives** : Auth.js (correctifs seulement) ; plugin organisation.
- **Statut** : ACCEPTÉ (RUN-02).

### ADR-009 — Rôles et permissions en code, affectations par site en base
- **Décision** : permissions et correspondance rôle → permissions en code ; affectations utilisateur × rôle × portée en base.
- **Alternatives** : rôles éditables.
- **Conséquences** : matrice d'autorisation testable de façon exhaustive.
- **Statut** : ACCEPTÉ (RUN-03).

### ADR-010 — RLS + couche d'accès unique + tests IDOR
- **Décision** : RLS PostgreSQL en défense en profondeur, services `src/core/**` comme seul accès aux données, tests IDOR automatisés.
- **Alternatives** : contrôle applicatif seul.
- **Statut** : ACCEPTÉ (RUN-03).

### ADR-011 — pg-boss + process worker
- **Décision** : file de tâches sur PostgreSQL (pg-boss) avec un process worker dans la même image ; pas de Redis.
- **Alternatives** : pg_cron ; Redis.
- **Statut** : ACCEPTÉ (RUN-04).

### ADR-012 — SSE avec repli polling
- **Décision** : Server-Sent Events pour l'agenda et les notifications, avec repli en polling.
- **Alternatives** : polling seul.
- **Statut** : ACCEPTÉ (RUN-06).

### ADR-013 — WhatsApp niveau N1 (liens `wa.me`)
- **Décision** : registre des lignes, routage, agents, modèles et journal, sur liens `wa.me` ; l'API Cloud (N3) viendra en pilote.
- **Alternatives** : Cloud API d'emblée.
- **Conséquences** : zéro coût ni approbation Meta ; on enregistre l'ouverture d'un lien, jamais un « envoyé ».
- **Statut** : ACCEPTÉ. Le RUN-01 applique déjà la règle des liens sans destinataire (ADR-025).

### ADR-014 — Acompte manuel validé par ID de transaction
- **Décision** : l'app n'encaisse rien ; le client envoie l'acompte au numéro Mobile Money du site ; le personnel le valide avec un ID de transaction unique contrôlé sur le compte de l'institut.
- **Alternatives** : agrégateur de paiement.
- **Statut** : ACCEPTÉ.

### ADR-015 — Pas d'e-mail en v1
- **Décision** : pas d'e-mail transactionnel ; invitations par lien partagé sur WhatsApp ; réinitialisation de mot de passe par un admin.
- **Statut** : ACCEPTÉ.

### ADR-016 — PWA native (manifest + `sw.js` maison)
- **Décision** : sans Serwist ni next-pwa. Prévue au RUN-13 ; HTTPS requis.
- **Statut** : ACCEPTÉ. Les icônes SVG d'application sont déjà générées (`public/brand/icon*.svg`).

### ADR-017 — Staging en `http://IP:PORT`
- **Décision** : staging sur le KVM, accès par IP et port. Cookies `Secure`, service worker, PWA et Web Push exigent HTTPS : le RUN-13 impose un nom d'hôte en HTTPS.
- **Statut** : ACCEPTÉ.

### ADR-018 — Images construites en CI (GHCR), jamais sur le KVM
- **Décision** : l'image est construite par GitHub Actions et publiée sur GHCR (dépôts clients). Aucun build sur le serveur.
- **Statut** : ACCEPTÉ. Le `Dockerfile` et le job `docker` de la CI sont en place.

---

## Versions figées

### ADR-019 — Node.js 22
- **Contexte** : `STANDARDS.md` §1 demande « Node.js LTS active ». Au 2026-10-08, la LTS active est Node 24 « Krypton » (24.21.0) ; Node 22 « Jod » (22.23.3) est en LTS de maintenance (support jusqu'à avril 2027). La démo et la sandbox tournaient en Node 22.
- **Décision** : **Node 22** est figé dans `.nvmrc` (`22`), `engines` (`>=22.13.0 <23`) et le `Dockerfile` (`node:22-alpine`), par prudence : un changement de majeure de Node n'est pas couvert par l'exception de gel actée pour Next 16.
- **Alternatives** : Node 24 (LTS active).
- **Conséquences** : Next 16 exige Node ≥ 20.9 : compatible. Le passage à Node 24 est un changement de trois lignes (`.nvmrc`, `engines`, `Dockerfile`) ; ESLint 10 exigerait Node ≥ 22.13.
- **Statut** : **À VALIDER** — Yass choisit entre rester sur 22 et passer à 24 avant le RUN-02.

### ADR-020 — Next.js 16.4.0
- **Décision** : `next@16.4.0` (version exacte, dernière stable au 2026-10-08), `eslint-config-next@16.4.0`. Migration faite avec le codemod officiel `@next/codemod upgrade` et le guide embarqué `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`.
- **Points du guide traités** : Turbopack par défaut (aucune configuration webpack) ; API de requête asynchrones (aucune route à paramètre, aucun `cookies()` / `headers()`) ; `middleware` → `proxy` (aucun middleware) ; cache (aucune API de cache) ; `next lint` retiré (ESLint direct, flat config native) ; `next/image` (SVG locaux sans chaîne de requête) ; pas de slot parallèle.
- **Alternatives** : rester en Next 15.5.27 (fin de maintenance le 21/10/2026).
- **Conséquences** : voir ADR-024 pour le poids. `tsconfig.json` a été reformaté par Next (`jsx: react-jsx`).
- **Statut** : ACCEPTÉ.

### ADR-021 — React 19.3.0
- **Décision** : `react@19.3.0` et `react-dom@19.3.0`, versions exactes. C'était déjà la dernière mineure : aucune montée. Next 16 embarque sa propre copie de React pour l'App Router.
- **Statut** : ACCEPTÉ.

### ADR-022 — Tailwind CSS 3.4.19 maintenu
- **Décision** : Tailwind reste en 3.4.19 ; aucune autre montée majeure (TypeScript 5.9.3, ESLint 9.39.5, Vitest 5.0.3, lucide-react 1.52).
- **Alternatives** : Tailwind 4 (montée majeure, GO requis).
- **Conséquences** : la chaîne Tailwind 3 porte les alertes `npm audit` restantes (voir `docs/SECURITY.md`) ; Tailwind 4 les supprimerait.
- **Statut** : ACCEPTÉ.

### ADR-023 — Playwright et axe-core en dépendances de développement
- **Contexte** : le RUN-01 exige un smoke Playwright à 375 et 1280 px ; `STANDARDS.md` §1 liste Playwright et `@axe-core/playwright`.
- **Décision** : `@playwright/test@1.64.0` et `@axe-core/playwright@4.13.0` (nouvelles dépendances, pas des montées). Les tests sont dans `e2e/`. Dans la sandbox de l'agent, un Chromium préinstallé est utilisé via `PW_CHROMIUM_PATH` ; la CI installe le navigateur.
- **Statut** : **À VALIDER**.

---

## Décisions du RUN-01 à valider

### ADR-024 — Budget de First Load JS sous Next 16
- **Contexte** : `STANDARDS.md` §7 : le First Load JS des routes publiques ne dépasse pas la base mesurée au RUN-01. Base `mahaza-demo` (Next 15.5.27) : `/` 142 kB, `/reserver` 168 kB.
- **Mesure** (gzip, même méthode, scripts du dépôt) : le **même code OVAGLOW** pèse **139,6 / 156,0 kB** sous Next 15.5.27 (sous la base) et **171,0 / 187,6 kB** sous Next 16.4.0. Le surcoût (~ +31 kB gzip) vient du runtime de Next 16 : la route `/_not-found`, qui ne contient que le framework, passe de 104 à 144 kB. Webpack (`--webpack`) donne 169,5 / 185,3 kB : Turbopack n'est pas en cause. Retirer le provider du layout ne gagne que ~4 kB.
- **Décision** : le budget de non-régression est fixé à **175 kB (`/`) et 192 kB (`/reserver`)** dans `scripts/first-load-budget.json`, contrôlé en CI. Le dépassement de la base de référence est **imputé à Next 16** et consigné dans `docs/runs/RUN-01.md`.
- **Alternatives** : (a) rester en Next 15 (fin de maintenance le 21/10/2026, contraire à ADR-002) ; (b) alléger le code applicatif : le plancher du framework (144 kB) dépasse déjà la base de `/`, donc aucun allègement du code ne suffit ; (c) charger les cartes cadeaux et le tunnel en différé, au gain limité.
- **Conséquences** : le critère d'acceptation « First Load JS ≤ base » du RUN-01 n'est **pas** tenu. À confirmer : nouvelle base = valeurs Next 16, ou plan d'allègement ciblé dès le RUN-04 (chargement différé, scission du store).
- **Statut** : **À VALIDER**.

### ADR-025 — `APP_ENV` à l'exécution, rendu dynamique, liens WhatsApp sans destinataire hors production
- **Contexte** : le bandeau « Version de développement – données fictives » et les liens WhatsApp sans destinataire dépendent de l'environnement ; une même image doit servir le staging et la production.
- **Décision** : `APP_ENV` (`development` | `staging` | `production`) est lu **à chaque requête** (le layout racine appelle `connection()` : toutes les pages sont rendues à la demande). Une valeur absente ou inconnue vaut `development`. Le bandeau et les liens `https://wa.me/?text=…` sont actifs **tant que `APP_ENV` ≠ `production`** (le plan ne cite que le staging ; l'extension à `development` évite qu'un numéro fictif reçoive un vrai message).
- **Alternatives** : `NEXT_PUBLIC_APP_ENV` figé au build (une image par environnement, contraire à ADR-018) ; liens sans destinataire en staging seulement.
- **Conséquences** : plus de pages prérendues statiquement (coût serveur marginal, aucun contenu personnalisé).
- **Statut** : **À VALIDER**.

### ADR-026 — Périmètre de l'anti-fuite de marque
- **Contexte** : `STANDARDS.md` §10 demande qu'un `git grep -i` sur « mahaza » et « st louis » ne renvoie rien « hors `docs/runs/` ». Or `CLAUDE.md`, `docs/PLAN.md` et `docs/STANDARDS.md`, qui font foi, nomment les dépôts clients.
- **Décision** : `npm run check:brand` (`scripts/check-brand-leak.mjs`, exécuté en CI) analyse tous les fichiers suivis et non ignorés, **chemins compris**, **sauf `docs/` et `CLAUDE.md`**. Le code, les tests, les scripts, les configurations, le README et les ressources publiques sont couverts.
- **Alternatives** : exclure seulement `docs/runs/` (le contrôle échouerait sur les trois fichiers de référence).
- **Statut** : **À VALIDER**.

### ADR-027 — Thèmes clair et sombre, surfaces inversées
- **Décision** : `src/brand/theme/tokens.css` définit les jetons (canaux RGB) en clair, en sombre selon `prefers-color-scheme` et en sombre forcé par `<html data-theme="dark">`. Deux jetons ajoutés : `inverse` / `inverse-foreground` (pied de page, hero, carte cadeau, infobulle : toujours des surfaces sombres) et `success-foreground`. `scripts/check-contrast.mjs` lit ce fichier et vérifie 48 couples par thème (WCAG 2.x AA), ainsi que l'égalité des deux blocs sombres. Aucune bascule manuelle : le thème suit le système.
- **Alternatives** : bascule manuelle clair / sombre ; inversion `foreground` / `background` (contrastes impossibles avec l'or).
- **Statut** : **À VALIDER** (palette : teal profond `#1F5B5E` et laiton `#C9A15B`).

### ADR-028 — Illustrations SVG générées, servies depuis `public/brand/`
- **Décision** : les visuels sont des SVG abstraits produits par `scripts/generate-brand-assets.mjs` (sortie déterministe), sans photo ni visage. Ils sont dans `public/brand/` (et `src/app/icon.svg` pour le favicon) plutôt que dans `src/brand/assets/`, car `next/image` et le favicon exigent des fichiers servis. `src/brand/copy/home.ts` les référence.
- **Statut** : **À VALIDER** (écart à la structure de `STANDARDS.md` §2).

### ADR-029 — Jeu de données FICTIF d'OVAGLOW
- **Décision** : 3 sites (« Site Aurore », « Site Brise », « Site Cèdre », ville et adresse fictives), 5 catégories et 20 soins avec **prix FICTIFS** en FCFA, durées non renseignées (créneaux indicatifs de 60 min), 15 praticiens, 15 salles, 26 réservations seed. Horaires fictifs. Numéro MoMo `6 00 00 00 00` affiché avec « FICTIF – ne pas payer ». Contact `contact@ovaglow.invalid` (TLD réservé). Aucun profil social.
- **Écart au plan** : ce jeu est écrit dès l'import (commit 3) pour que la suite de tests reste verte, au lieu de l'étape 5.
- **Statut** : **À VALIDER**.

### ADR-030 — Store en mémoire transitoire conservé
- **Décision** : l'état de la démo (`src/core/state/store.tsx`) reste en mémoire React jusqu'à son remplacement par les services serveur (RUN-02 et suivants). Deux règles `react-hooks` 7 (`refs`, `set-state-in-effect`) sont désactivées localement, avec justification, car elles sont issues du React Compiler que le projet n'active pas.
- **Statut** : **À VALIDER**.

### ADR-031 — Textes non encore centralisés par module
- **Contexte** : `STANDARDS.md` §7 demande des textes centralisés par module (`copy.ts`) pour une i18n future.
- **Décision** : au RUN-01, seul le contenu éditorial d'accueil est isolé (`src/brand/copy/home.ts`) ; les libellés d'interface restent dans les composants. La centralisation est reportée aux runs qui réécrivent ces écrans.
- **Statut** : **À VALIDER**.

### ADR-032 — Cartes cadeaux conservées comme simulation FICTIVE
- **Décision** : l'accueil garde le studio de cartes cadeaux de la démo, explicitement présenté comme simulation (code `GC-…` fictif non valable, aucun paiement, lien WhatsApp sans destinataire). La vraie carte cadeau est au RUN-15.
- **Risque** : `STANDARDS.md` §13 interdit d'annoncer une fonctionnalité non construite ; la simulation est signalée à l'écran. À retirer si Yass préfère.
- **Statut** : **À VALIDER**.

### ADR-033 — Jobs e2e et Docker dans la CI du RUN-01
- **Décision** : en plus du minimum demandé, la CI exécute le smoke Playwright (job `e2e`) et démarre l'image (job `docker`, `/api/health`). Gitleaks, Trivy, `npm audit` et axe en CI complète viennent au RUN-03.
- **Statut** : **À VALIDER**.

### ADR-034 — Turbopack par défaut
- **Décision** : `next build` et `next dev` utilisent Turbopack (défaut de Next 16) ; aucune configuration webpack n'existe. `--webpack` reste disponible (poids un peu plus faible : voir ADR-024). `scripts/measure-first-load.mjs` lit `.next/diagnostics/route-bundle-stats.json`, produit par Turbopack.
- **Statut** : **À VALIDER**.
