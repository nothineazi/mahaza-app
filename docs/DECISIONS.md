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
| 019 | Node.js 24 LTS (22 refusé) | ACCEPTÉ (RUN-01b) |
| 020 | Next.js 16.4.0 | ACCEPTÉ (version exacte : à confirmer) |
| 021 | React 19.3.0 | ACCEPTÉ |
| 022 | Tailwind CSS 3.4.19 maintenu | REMPLACÉ par ADR-035 |
| 023 | Playwright et axe-core en dépendances de développement | ACCEPTÉ |
| 024 | Budget de First Load JS sous Next 16 | REMPLACÉ par ADR-040 (RUN-01b) |
| 025 | `APP_ENV` à l'exécution, rendu dynamique, liens WhatsApp sans destinataire hors production | ACCEPTÉ |
| 026 | Périmètre de l'anti-fuite de marque | ACCEPTÉ |
| 027 | Thèmes clair et sombre, surfaces inversées | REMPLACÉ (RUN-01b, mode sombre par classe) |
| 028 | Illustrations SVG générées, servies depuis `public/brand/` | ACCEPTÉ |
| 029 | Jeu de données FICTIF d'OVAGLOW | ACCEPTÉ |
| 030 | Store en mémoire transitoire conservé | ACCEPTÉ |
| 031 | Textes non encore centralisés par module | ACCEPTÉ |
| 032 | Cartes cadeaux conservées comme simulation FICTIVE | ACCEPTÉ |
| 033 | Jobs e2e et Docker dans la CI du RUN-01 | ACCEPTÉ |
| 034 | Turbopack par défaut | ACCEPTÉ |
| 035 | Tailwind CSS 4.3.3, configuration CSS-first | ACCEPTÉ (GO de Yass, RUN-01b) |
| 036 | Couche design factory : deux registres, jetons OKLCH, mode sombre par classe | ACCEPTÉ (Yass, RUN-P) |
| 037 | Correspondance des statuts de réservation → tons de `StatusBadge` | ACCEPTÉ (Yass, RUN-P) |
| 038 | Polices auto-hébergées : Inter, Cormorant Garamond, JetBrains Mono | ACCEPTÉ (Yass, RUN-P) |
| 039 | Matrice statut → action primaire de la fiche de réservation | **ACCEPTÉ provisoirement** (RUN-P) : à valider avec la gérante et la réception (PLAN §6) |
| 040 | Allègement : store hors de l'accueil, chargement différé, nouveau budget de poids | ACCEPTÉ (Yass, RUN-P) |
| 041 | Persistance de l'état de la démo dans `sessionStorage` | **À VALIDER** |
| 042 | Personnalisation par la marque : vocabulaire, logo, pictogrammes, mention de pied de page | **À VALIDER** |
| 043 | Plan allégé : RUN-P, RUN-A, RUN-B, RUN-C ; le reste reporté en maintenance | ACCEPTÉ (consigne du RUN-P) |
| 044 | Tests du socle indépendants de la marque ; e2e pilotés par la marque | **À VALIDER** |
| 045 | Dérivation des apps depuis le tag `demo-v0.1` et publication GHCR | **À VALIDER** |

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

### ADR-019 — Node.js 24 LTS
- **Contexte** : `STANDARDS.md` §1 demande « Node.js LTS active ». Le RUN-01 avait figé Node 22 par prudence et soumis le choix à Yass. **Décision de Yass (RUN-01b) : Node 22 refusé, Node 24 retenu.**
- **Calendrier officiel** (`nodejs/Release`, `schedule.json`, lu le 2026-10-08) :

  | Version | Début | LTS active | Maintenance | Fin de vie |
  |---|---|---|---|---|
  | 22 « Jod » | 2024-04-24 | 2024-10-29 | 2025-10-21 | **2027-04-30** |
  | **24 « Krypton »** | 2025-05-06 | **2025-10-28** | **2026-10-20** | **2028-04-30** |
  | 26 | 2026-05-05 | 2026-10-28 | 2027-10-20 | 2029-04-30 |

  Dernière 24.x au 2026-10-08 : **24.21.0** (2026-09-07). Précision : Node 24 passe en maintenance le 2026-10-20 et Node 26 devient LTS active le 2026-10-28 ; Node 24 reste toutefois supporté (correctifs de sécurité) **jusqu'au 2028-04-30**, soit 12 mois de plus que Node 22.
- **Décision** : **Node 24** dans `.nvmrc` (`24`), `engines` (`>=24.0.0 <25`), `Dockerfile` (`node:24-alpine`, trois étapes) et la CI (`setup-node` lit `.nvmrc`). `@types/node` passe en `^24` (typage de l'API Node ciblée, version majeure imposée par ce changement de runtime).
- **Alternatives** : rester en Node 22 (refusé) ; Node 26 (pas encore LTS).
- **Conséquences** : Next 16, React 19.3 et la chaîne d'outils fonctionnent sans changement de code. Le passage à Node 26 est à reconsidérer après le 2026-10-28 (changement de trois lignes : `.nvmrc`, `engines`, `Dockerfile`) ; aucune urgence avant 2028.
- **Statut** : **ACCEPTÉ** (RUN-01b).

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
- **Statut** : **REMPLACÉ** par ADR-035 (RUN-01b : Tailwind 4, GO de Yass).

### ADR-023 — Playwright et axe-core en dépendances de développement
- **Contexte** : le RUN-01 exige un smoke Playwright à 375 et 1280 px ; `STANDARDS.md` §1 liste Playwright et `@axe-core/playwright`.
- **Décision** : `@playwright/test@1.64.0` et `@axe-core/playwright@4.13.0` (nouvelles dépendances, pas des montées). Les tests sont dans `e2e/`. Dans la sandbox de l'agent, un Chromium préinstallé est utilisé via `PW_CHROMIUM_PATH` ; la CI installe le navigateur.
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b).

---

## Décisions du RUN-01 à valider

### ADR-024 — Budget de First Load JS sous Next 16
- **Contexte** : `STANDARDS.md` §7 : le First Load JS des routes publiques ne dépasse pas la base mesurée au RUN-01. Base `mahaza-demo` (Next 15.5.27) : `/` 142 kB, `/reserver` 168 kB.
- **Mesure** (gzip, même méthode, scripts du dépôt) : le **même code OVAGLOW** pèse **139,6 / 156,0 kB** sous Next 15.5.27 (sous la base) et **171,0 / 187,6 kB** sous Next 16.4.0. Le surcoût (~ +31 kB gzip) vient du runtime de Next 16 : la route `/_not-found`, qui ne contient que le framework, passe de 104 à 144 kB. Webpack (`--webpack`) donne 169,5 / 185,3 kB : Turbopack n'est pas en cause. Retirer le provider du layout ne gagne que ~4 kB.
- **Décision** : le budget de non-régression est fixé à **175 kB (`/`) et 192 kB (`/reserver`)** dans `scripts/first-load-budget.json`, contrôlé en CI. Le dépassement de la base de référence est **imputé à Next 16** et consigné dans `docs/runs/RUN-01.md`.
- **Alternatives** : (a) rester en Next 15 (fin de maintenance le 21/10/2026, contraire à ADR-002) ; (b) alléger le code applicatif : le plancher du framework (144 kB) dépasse déjà la base de `/`, donc aucun allègement du code ne suffit ; (c) charger les cartes cadeaux et le tunnel en différé, au gain limité.
- **Conséquences** : le critère d'acceptation « First Load JS ≤ base » du RUN-01 n'est **pas** tenu. À confirmer : nouvelle base = valeurs Next 16, ou plan d'allègement ciblé dès le RUN-04 (chargement différé, scission du store).
- **Statut** : **ACCEPTÉ provisoirement** (Yass, RUN-01b : plafonds 175 kB pour `/` et 192 kB pour `/reserver`), puis **REMPLACÉ** à la fin du RUN-01b par la nouvelle mesure et le nouveau budget de l'ADR-040.

### ADR-025 — `APP_ENV` à l'exécution, rendu dynamique, liens WhatsApp sans destinataire hors production
- **Contexte** : le bandeau « Version de développement – données fictives » et les liens WhatsApp sans destinataire dépendent de l'environnement ; une même image doit servir le staging et la production.
- **Décision** : `APP_ENV` (`development` | `staging` | `production`) est lu **à chaque requête** (le layout racine appelle `connection()` : toutes les pages sont rendues à la demande). Une valeur absente ou inconnue vaut `development`. Le bandeau et les liens `https://wa.me/?text=…` sont actifs **tant que `APP_ENV` ≠ `production`** (le plan ne cite que le staging ; l'extension à `development` évite qu'un numéro fictif reçoive un vrai message).
- **Alternatives** : `NEXT_PUBLIC_APP_ENV` figé au build (une image par environnement, contraire à ADR-018) ; liens sans destinataire en staging seulement.
- **Conséquences** : plus de pages prérendues statiquement (coût serveur marginal, aucun contenu personnalisé).
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b).

### ADR-026 — Périmètre de l'anti-fuite de marque
- **Contexte** : `STANDARDS.md` §10 demande qu'un `git grep -i` sur « mahaza » et « st louis » ne renvoie rien « hors `docs/runs/` ». Or `CLAUDE.md`, `docs/PLAN.md` et `docs/STANDARDS.md`, qui font foi, nomment les dépôts clients.
- **Décision** : `npm run check:brand` (`scripts/check-brand-leak.mjs`, exécuté en CI) analyse tous les fichiers suivis et non ignorés, **chemins compris**, **sauf `docs/` et `CLAUDE.md`**. Le code, les tests, les scripts, les configurations, le README et les ressources publiques sont couverts.
- **Alternatives** : exclure seulement `docs/runs/` (le contrôle échouerait sur les trois fichiers de référence).
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b).

### ADR-027 — Thèmes clair et sombre, surfaces inversées
- **Décision** : `src/brand/theme/tokens.css` définit les jetons (canaux RGB) en clair, en sombre selon `prefers-color-scheme` et en sombre forcé par `<html data-theme="dark">`. Deux jetons ajoutés : `inverse` / `inverse-foreground` (pied de page, hero, carte cadeau, infobulle : toujours des surfaces sombres) et `success-foreground`. `scripts/check-contrast.mjs` lit ce fichier et vérifie 48 couples par thème (WCAG 2.x AA), ainsi que l'égalité des deux blocs sombres. Aucune bascule manuelle : le thème suit le système.
- **Alternatives** : bascule manuelle clair / sombre ; inversion `foreground` / `background` (contrastes impossibles avec l'or).
- **Statut** : **REMPLACÉ** (Yass, RUN-01b) par le mode sombre de la factory : classe `.dark`, `next-themes`, bascule dans le back-office (voir ADR-036).

### ADR-028 — Illustrations SVG générées, servies depuis `public/brand/`
- **Décision** : les visuels sont des SVG abstraits produits par `scripts/generate-brand-assets.mjs` (sortie déterministe), sans photo ni visage. Ils sont dans `public/brand/` (et `src/app/icon.svg` pour le favicon) plutôt que dans `src/brand/assets/`, car `next/image` et le favicon exigent des fichiers servis. `src/brand/copy/home.ts` les référence.
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b).

### ADR-029 — Jeu de données FICTIF d'OVAGLOW
- **Décision** : 3 sites (« Site Aurore », « Site Brise », « Site Cèdre », ville et adresse fictives), 5 catégories et 20 soins avec **prix FICTIFS** en FCFA, durées non renseignées (créneaux indicatifs de 60 min), 15 praticiens, 15 salles, 26 réservations seed. Horaires fictifs. Numéro MoMo `6 00 00 00 00` affiché avec « FICTIF – ne pas payer ». Contact `contact@ovaglow.invalid` (TLD réservé). Aucun profil social.
- **Écart au plan** : ce jeu est écrit dès l'import (commit 3) pour que la suite de tests reste verte, au lieu de l'étape 5.
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b).

### ADR-030 — Store en mémoire transitoire conservé
- **Décision** : l'état de la démo (`src/core/state/store.tsx`) reste en mémoire React jusqu'à son remplacement par les services serveur (RUN-02 et suivants). Deux règles `react-hooks` 7 (`refs`, `set-state-in-effect`) sont désactivées localement, avec justification, car elles sont issues du React Compiler que le projet n'active pas.
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b).

- **Amendement RUN-P** : l'état est désormais persisté dans `sessionStorage` (ADR-041). Le store reste transitoire : il sera remplacé par les services serveur du RUN-A / RUN-B.

### ADR-031 — Textes non encore centralisés par module
- **Contexte** : `STANDARDS.md` §7 demande des textes centralisés par module (`copy.ts`) pour une i18n future.
- **Décision** : au RUN-01, seul le contenu éditorial d'accueil est isolé (`src/brand/copy/home.ts`) ; les libellés d'interface restent dans les composants. La centralisation est reportée aux runs qui réécrivent ces écrans.
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b).

### ADR-032 — Cartes cadeaux conservées comme simulation FICTIVE
- **Décision** : l'accueil garde le studio de cartes cadeaux de la démo, explicitement présenté comme simulation (code `GC-…` fictif non valable, aucun paiement, lien WhatsApp sans destinataire). La vraie carte cadeau est au RUN-15.
- **Risque** : `STANDARDS.md` §13 interdit d'annoncer une fonctionnalité non construite ; la simulation est signalée à l'écran. À retirer si Yass préfère.
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b) : cartes cadeaux simulées, marquées à l'écran.

### ADR-033 — Jobs e2e et Docker dans la CI du RUN-01
- **Décision** : en plus du minimum demandé, la CI exécute le smoke Playwright (job `e2e`) et démarre l'image (job `docker`, `/api/health`). Gitleaks, Trivy, `npm audit` et axe en CI complète viennent au RUN-03.
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b).

### ADR-034 — Turbopack par défaut
- **Décision** : `next build` et `next dev` utilisent Turbopack (défaut de Next 16) ; aucune configuration webpack n'existe. `--webpack` reste disponible (poids un peu plus faible : voir ADR-024). `scripts/measure-first-load.mjs` lit `.next/diagnostics/route-bundle-stats.json`, produit par Turbopack.
- **Statut** : **ACCEPTÉ** (Yass, RUN-01b).

---

## Décisions du RUN-01b

### ADR-035 — Tailwind CSS 4.3.3, configuration CSS-first
- **Contexte** : GO de Yass pour la montée majeure Tailwind 3 → 4 (exception à CLAUDE.md §4, ADR-022 remplacé). Les fondations visuelles (design factory) sont écrites en CSS-first (`@theme`) : migrer avant de les poser évite de les refaire.
- **Décision** : `tailwindcss@4.3.3` + `@tailwindcss/postcss@4.3.3`, migration par l'outil officiel `@tailwindcss/upgrade` (guide : tailwindcss.com/docs/upgrade-guide), puis reprise à la main. Plus de `tailwind.config.ts` ni d'`autoprefixer` (Lightning CSS est intégré). Le pont jetons → classes est dans `src/app/globals.css` (`@theme inline`, valeurs `rgb(var(--x))`). `tailwindcss-animate` (plugin v3, non maintenu) est remplacé par `tw-animate-css@1.4.0` (MIT, CSS pur, même noms de classes `animate-in`, `fade-in-*`, `zoom-in-*`, `slide-in-from-*`), en dépendance de développement.
- **Pièges rencontrés et corrigés** (détail dans `docs/runs/RUN-01b.md`) : (1) l'outil a renommé à tort la variante de bouton `"outline"` en `"outline-solid"` (une chaîne, pas une classe) ; (2) `src/brand/theme/effects.css` n'était pas dans une couche CSS : en Tailwind 4 une règle hors couche l'emporte sur les classes utilitaires (`tracking-*`, `outline-*`) ; il est maintenant importé après Tailwind, dans `@layer base` / `@layer components` ; (3) en v3, un `sm:text-5xl` imposait son interligne à une classe `leading-*` de base (ordre CSS) ; en v4, `leading-*` l'emporte : cinq éléments reçoivent `sm:leading-none` / `sm:leading-9` / `sm:leading-7` pour garder le rendu à l'identique ; (4) `bg-success/12` (opacité hors échelle v3, donc ignorée) est désormais appliquée : la pastille « Active » des salles et de l'équipe a maintenant son fond vert pâle voulu ; (5) le curseur « main » des boutons n'est plus posé par défaut : rétabli en `@layer base`.
- **Alternatives** : rester en Tailwind 3 (chaîne de build portant 5 des 10 alertes `npm audit`).
- **Conséquences** : rendu public pixel-identique (32 captures comparées, voir le rapport) ; `npm audit` passe de 10 à 5 alertes (voir `docs/SECURITY.md`). Les jetons en canaux RGB sont conservés jusqu'à la couche design factory (étape 3).
- **Statut** : **ACCEPTÉ** (GO de Yass).

### ADR-036 — Couche design factory : deux registres, jetons OKLCH, mode sombre par classe
- **Contexte** : Yass demande d'appliquer `docs/reference/factory-core.md` (design system de la factory) avant de construire les écrans du back-office. Il remplace ADR-027 (thèmes par `prefers-color-scheme` / `data-theme`, jetons en canaux RGB).
- **Décision** :
  1. **Deux registres.** Le back-office (`/admin`) suit strictement le système factory ; le site public garde son registre premium éditorial (pilules, rayons 2xl/3xl, ombres douces, graisses 500/600, serif d'affichage) et **ne partage que les jetons de couleur**. Les règles du back-office (échelle `text-kv-*`, graisses 450/520/600, rayons 0,5 rem, filet `--border`) ne s'appliquent que dans une zone `.kv-app` : posée sur la coque du back-office et sur les surfaces que Radix rend hors de la coque par un portail (fiches `ModalContent`, tiroir mobile).
  2. **Jetons** : `src/brand/theme/tokens.css`, seul fichier de couleurs de la marque, en OKLCH, recette des neutres teintés (§2.2) avec la teinte **H = 200** (teal d'OVAGLOW, mesurée sur `#1F5B5E` : L 0,434 · C 0,061 · H 199,8). Les rapports L/C de la recette sont conservés ; les chromas que la gamme sRGB ne peut pas atteindre à cette teinte sont bornés (`secondary-foreground` 0,06 au lieu de 0,18 ; `muted-foreground` 0,065 au lieu de 0,08). Accent = `--primary` (clair `#1F5B5E`, sombre teal clair L 0,79) ; `--primary-text` existe (égal à `--primary` dans les deux thèmes : l'accent sombre est déjà clair, il passe 4,5:1 en texte).
  3. **Conflit de noms** : en factory `--accent` est une surface teintée discrète ; sur le site public `accent` était le laiton doré. Le laiton devient `--gold` / `--gold-foreground` (classes `bg-gold`, `text-gold`…, 38 occurrences renommées), `--accent` prend le sens factory. Les surfaces toujours sombres du site public restent `--inverse` / `--inverse-foreground`.
  4. **Filet** : `--border` / `--input` ≥ 3:1 (WCAG 1.4.11) comme la factory, mais ce filet est lourd pour le site public ; celui-ci utilise `--line` (filet décoratif, `border-line`). Défaut du projet : `--line` ; dans `.kv-app` : `--border`.
  5. **Mode sombre** : classe `.dark` sur `<html>` par `next-themes@0.4.6` (`attribute="class"`, `defaultTheme="system"`), `color-scheme` natif dans les deux thèmes, bouton clair/sombre dans la coque du back-office (les deux icônes sont alternées en CSS : pas d'état client, pas de décalage d'hydratation). Le choix est mémorisé dans le navigateur ; le site public suit le même thème (même classe).
  6. **Échelle kv** (§3) déclarée en `@theme` sans `inline`, surcharge mobile < 640 px, graisses redéfinies dans `.kv-app`, `cn()` étendu (`extendTailwindMerge`, six tailles kv, testé).
  7. **Composants** `src/ui/kv/` : `Panel`, `PanelHeader`, `StatusBadge`, `Field`, `PageHeader`, `StateBlock`, `DataTable`, `ActionBar`, `Segmented`, `control-classes`, plus `Skeleton`, `ThemeToggle`. Les primitives du site public (`src/ui/primitives`) ne sont pas modifiées.
  8. **Coque** (§5.9) : barre latérale de 216 px dès `md` (jetons `sidebar-*`, elle suit le thème), en-tête mobile et tiroir Radix sous `md`, sélecteur de site dans la barre latérale.
  9. **Garde-fou** `scripts/check-design.mjs` : périmètre `src/app/admin`, `src/ui/admin`, `src/ui/kv` (le site public est exclu) ; 8 motifs (les 3 de la factory plus ses angles morts : rayons 2xl+, `p-6` / `py-16` / `gap-3`, graisses 700+, couleurs en dur, ombres premium) ; **exception déclarée** par commentaire `check-design-allow(<motif>): <raison>`, limitée au motif nommé (le mécanisme manquait en factory) ; `--strict` en CI.
  10. **Contrastes** : `scripts/check-contrast.mjs` réécrit (OKLCH, composition des transparences, refus d'un jeton hors gamme sRGB) : 79 couples par thème, 0 échec. Tableau complet : `docs/runs/RUN-01b-contrastes.md`. Extrait (couples du §9 de la factory) :

    | Couple | Seuil | Clair | Sombre |
    |---|---:|---:|---:|
    | foreground / background | 4,5 | 18,97 | 19,22 |
    | muted-foreground / card | 4,5 | 5,82 | 7,69 |
    | muted-foreground / muted | 4,5 | 5,21 | 6,50 |
    | primary-foreground / primary (bouton) | 4,5 | 7,74 | 9,60 |
    | primary-text sur card | 4,5 | 7,74 | 9,99 |
    | primary-text sur info-bg | 4,5 | 6,56 | 7,68 |
    | destructive / card | 4,5 | 6,08 | 7,06 |
    | badges de statut (fg / bg), minimum des cinq | 4,5 | 5,21 | 6,50 |
    | border / card (non-texte) | 3 clair · 1,3 sombre | 3,15 | **1,70** (bordure de carte décorative, comme la factory) |
    | input / card (champ) | 3 | 3,15 | 3,54 |
    | ring / card | 3 | 7,74 | 9,99 |

- **Ignoré volontairement** (hors périmètre OVAGLOW) : FR + EN, copy Koverit, page de paiement, Copilot, PWA (RUN-13), graphiques (aucune dataviz). Aucune valeur de marque Koverit n'est reprise.
- **Écarts à la factory** : filet `--line` du site public (point 4) ; couleur de la barre `themeColor` du navigateur : suit toujours la préférence système (écart n° 10 de la factory), car le bouton ne la modifie pas ; `next-themes` injecte un script en ligne : à couvrir par le nonce de la CSP au RUN-04.
- **Conséquence visible** : le fond du site public passe du crème `#F8F6F2` au gris-teal quasi neutre de la recette (`oklch(0,985 0,002 200)`) ; le sombre devient plus profond. À valider visuellement (4 combinaisons).
- **Alternatives** : thème sombre par `prefers-color-scheme` seul (pas de bouton) ; un seul registre pour les deux sites (perd l'identité éditoriale du site public).
- **Statut** : **ACCEPTÉ** (Yass, RUN-P).

### ADR-037 — Correspondance des statuts de réservation → tons de `StatusBadge`
- **Contexte** : la factory définit quatre tons de facture (`paid`, `overdue`, `pending`, `draft`) ; OVAGLOW a cinq statuts de réservation. Un badge coloré par ligne au maximum ; le texte porte toujours le sens.
- **Décision** :

  | Statut | Ton | Jetons (`--status-*`) | Lecture |
  |---|---|---|---|
  | `pending_deposit` | `pending` | `warning` sur `warning-bg` (ambre) | action attendue : valider l'acompte |
  | `confirmed` | `confirmed` | `success` sur `success-bg` (vert) | acquis |
  | `completed` | `completed` | `primary-text` sur `info-bg` (teinte de marque) | terminé, sans action |
  | `cancelled` | `cancelled` | `muted-foreground` sur `muted` (neutre) | sans effet |
  | `no_show` | `noshow` | `status-noshow-fg` (rouge, valeur propre) sur `danger-bg` | à surveiller |

  Deux tons génériques s'y ajoutent pour les états qui ne sont pas des statuts de réservation : `success` (actif) et `neutral` (inactif, repère). Les blocs du planning réutilisent les mêmes jetons (fond = `-bg`, liseré gauche = `-fg`). Les cinq couples ont un contraste ≥ 4,5:1 dans les deux thèmes (minimum 5,21 clair, 6,50 sombre).
- **Alternatives** : réutiliser telles quelles les quatre tons de la factory (confond « terminé » et « confirmé » ou « annulé » et « no-show »).
- **Statut** : **ACCEPTÉ** (Yass, RUN-P).

### ADR-038 — Polices auto-hébergées : Inter, Cormorant Garamond, JetBrains Mono
- **Contexte** : le build dépendait de Google Fonts (`next/font/google`) : un build sans réseau échouait (risque n° 5 du RUN-01), et le code est cédé aux clients, donc les licences doivent être ouvertes et versionnées.
- **Décision** : trois rôles, tous via `next/font/local`, fichiers versionnés dans `src/brand/fonts/` avec le `OFL.txt` de chaque police et un `README.md` (provenance, empreintes SHA-256) ; `next/font/google` supprimé (un test unitaire interdit son retour et tout lien vers un service de polices).

  | Rôle | Police (licence) | Poids chargés | Poids réel |
  |---|---|---|---|
  | `--font-sans` | **Inter** variable (SIL OFL 1.1) | axe de graisse 100-900, un fichier | 47 Ko |
  | `--font-display` | **Cormorant Garamond** (SIL OFL 1.1) | 500 (titres), 600 (wordmark, titre d'écran du back-office) | 2 × 23 Ko |
  | `--font-mono` | **JetBrains Mono** variable (SIL OFL 1.1) | axe de graisse, `preload: false` | 40 Ko, chargée à la première utilisation (back-office) |

  Sous-ensemble `latin` de Fontsource : tout le français (accents, œ, « », €, espace fine insécable). Les rôles pointent vers `--font-face-*` (jamais vers eux-mêmes) ; repli ajusté (`adjustFontFallback`) contre les décalages de mise en page.
- **Pourquoi ces choix pour OVAGLOW** : Inter est lisible à 13-14 px et sa graisse variable donne exactement les 450 / 520 / 600 de l'échelle kv ; Cormorant Garamond garde la serif éditoriale du site public (même famille qu'au RUN-01, déjà validée visuellement) pour le wordmark et les titres ; JetBrains Mono sert aux références de réservation (chiffres non ambigus). Le site public garde donc sa serif d'affichage.
- **Retraits pour ne pas charger de fichier inutile** : plus d'italique Cormorant (message de la carte cadeau en romain), plus d'italique Inter (note d'horaires du pied de page en romain), plus de `font-mono` sur le site public (code de carte cadeau en chiffres tabulaires Inter) : la police mono n'est jamais téléchargée par les pages publiques. La police de corps du site public passe de la pile système à Inter.
- **Alternatives** : Geist (déjà celle de la factory, mais aucune raison de marque) ; fichiers « latin-ext » (inutiles en français) ; polices système seules (rendu différent d'un appareil à l'autre, y compris la graisse 450/520).
- **Conséquences** : poids des polices public = 47 + 46 = 93 Ko (précédemment ≈ 3 fichiers Google téléchargés à l'exécution) ; le build ne contacte plus aucun serveur (vérifié avec un proxy HTTPS volontairement mort) ; Docker n'a plus besoin de réseau pour les polices. Un dépôt client change de police en remplaçant le dossier **avec sa licence**.
- **Statut** : **ACCEPTÉ** (Yass, RUN-P).

### ADR-039 — Matrice statut → action primaire de la fiche de réservation
- **Contexte** : la factory (§5.7) impose UNE action primaire adaptée au statut, toutes les autres actions restant visibles en secondaire, et seule l'action destructive dans un menu ; elle précise que cette matrice est une règle métier à faire valider avant de coder. Le run est autonome (`CLAUDE.md` §3) : choix le plus sûr et réversible, consigné ici.
- **Décision** (les transitions autorisées sont inchangées, `src/core/booking/lifecycle.ts`) :

  | Statut | Primaire | Secondaires (visibles) | Menu « Autres actions » (destructif) |
  |---|---|---|---|
  | `pending_deposit` | **Acompte reçu : confirmer** | Déplacer · Rappel WhatsApp | Annuler la réservation |
  | `confirmed` | **Marquer terminée** | Marquer no-show · Remettre en attente d'acompte · Déplacer · Rappel WhatsApp | Annuler la réservation |
  | `completed` | – | Rétablir en confirmée · Déplacer | – |
  | `no_show` | – | Rétablir en confirmée · Déplacer | – |
  | `cancelled` | – | Rouvrir (en attente d'acompte) · Rouvrir (confirmée) · Déplacer | – |

  Raison : l'action la plus fréquente de chaque statut actif fait avancer le cycle (valider l'acompte, puis clôturer) ; les corrections et réouvertures restent visibles mais ne sont jamais mises en avant ; l'annulation est la seule action destructive. Une action indisponible (ex. « Marquer terminée » avant le jour du rendez-vous) reste affichée, désactivée, avec sa raison écrite sous les actions et reliée par `aria-describedby`.
- **Écart** : la factory place « tout le reste » en secondaire sans limite ; ici « Remettre en attente d'acompte » et « Marquer no-show » s'ajoutent au statut `confirmed` (quatre secondaires). Sur mobile, les secondaires se partagent la ligne (`flex-1`).
- **Alternatives** : aucune primaire pour `confirmed` (la clôture serait moins visible) ; primaire « Déplacer » (action fréquente mais pas une avancée du cycle).
- **Statut** : **ACCEPTÉ provisoirement** (Yass, RUN-P) : à valider avec la gérante et la réception (ajouté à `docs/PLAN.md` §6, question 13) ; changer la matrice = une table `PRIMARY_TRANSITION` dans `src/ui/admin/reservation-dialog.tsx`.

### ADR-040 — Allègement : store hors de l'accueil, chargement différé, nouveau budget de poids
- **Contexte** : Yass a accepté provisoirement 175 / 192 kB (ADR-024) et demande, à la fin du RUN-01b, d'expliquer l'écart de `/_not-found` (104 → 144 kB), de différer le tunnel de réservation et les cartes cadeaux, de scinder le store, puis de remesurer et de rapprocher le budget de la base (142 / 168 kB).
- **Analyse de l'écart de `/_not-found`** (First Load JS, gzip niveau 9, même script `scripts/measure-first-load.mjs`) — **framework ou code applicatif ?**

  | Mesure | `/_not-found` ou `/` d'une application vide (layout + une page de texte) |
  |---|---:|
  | Next 15.5.27 (webpack) | **103** (`/_not-found` : 104) |
  | Next 16.4.0 (Turbopack), React 19.3.0 | **134,7** |
  | **Écart dû à Next 16 + React 19.3** | **+31,7 kB** |

  Dans OVAGLOW, `/_not-found` valait 144,1 kB sous Next 16 : **134,7 kB de framework (93 %)** et **9,4 kB de code applicatif** (providers du layout racine : store de la démo avec ses données seed et le moteur de planification, thème, environnement). Sur les +40,1 kB observés au RUN-01 (104 → 144,1), **31,7 kB (79 %) viennent du framework** (aucun code applicatif ne peut les retirer) et 8,4 kB (21 %) du layout racine d'OVAGLOW, que cet ADR supprime. Après l'allègement, `/_not-found` pèse **136,5 kB** : 1,8 kB au-dessus du plancher de Next 16.
- **Décisions** :
  1. **Scission du store** : le `AppStoreProvider` (état de la démo, seed, moteur) quitte le layout racine pour un layout de groupe de routes `src/app/(app)/layout.tsx` qui n'enveloppe que `/reserver` et `/admin` (les URL ne changent pas). L'accueil et les pages d'erreur ne téléchargent plus ce code. Le store persiste entre `/reserver` et `/admin` ; **il repart des données seed si l'on passe par l'accueil** (écart assumé : le store est transitoire, ADR-030, et sera remplacé par des services serveur au RUN-02). Les cartes cadeaux sortent du store (état local du composant, type `GiftCard` dans `core/booking/gift-card.ts`).
  2. **Cartes cadeaux différées** : titre et texte rendus par le serveur ; le studio (formulaire, aperçu, code, lien WhatsApp) n'est téléchargé que lorsque la section approche de l'écran (`IntersectionObserver`, marge de 600 px). Le gabarit a les hauteurs exactes de la section chargée à 375 et 1280 px (CLS mesuré 0,0000 pendant un défilement complet).
  3. **Hero** : le texte et les boutons restent côté serveur ; seule l'alternance des images est un composant client (`hero-images.tsx`, sans fusion de classes ni donnée de marque côté client : `tailwind-merge` n'est plus dans l'accueil).
  4. **Tunnel de réservation différé** : les étapes après le choix des soins (praticien, créneau, acompte, confirmation avec `.ics`, compte à rebours et lien WhatsApp) sont chargées à la demande (`next/dynamic`), l'étape suivante étant préchargée au repos du navigateur ; la feuille mobile du récapitulatif (dialogue Radix) n'est montée qu'à la première ouverture et préchargée au repos.
- **Mesures** (First Load JS en kB gzip, tableau complet dans `docs/runs/RUN-01b.md`) :

  | Route | Base Next 15 | RUN-01 (Next 16) | Fin d'étape 5 | **Après allègement** | Budget CI (ADR-040) | Ancien budget |
  |---|---:|---:|---:|---:|---:|---:|
  | `/` | 142 | 171,0 | 172,4 | **146,9** | **149** | 175 |
  | `/reserver` | 168 | 187,6 | 188,7 | **170,2** | **172** | 192 |
  | `/_not-found` | 104 | 144,1 | 145,4 | **136,5** | – | – |
  | `/admin` (6 écrans : 183,4 à 187,8) | 149-156 | 179-183 | 183-187 | 183,4 à 187,8 | – | – |

  Écart restant à la base : **+4,9 kB sur `/`** et **+2,2 kB sur `/reserver`**, alors que le plancher de Next 16 est à 134,7 kB (contre 103 pour Next 15). Les 12,1 kB de `/` au-dessus du plancher se répartissent entre `next/image` et `next/link` (code client du framework), `lucide-react`, le thème (`next-themes`, 1,4 kB) et le hero.
- **Budget** : `scripts/first-load-budget.json` passe à **149 kB (`/`) et 172 kB (`/reserver`)** (mesure + ~1,5 %), contrôlé en CI. Les routes `/admin/*` ne sont pas budgétées (outil interne, derrière authentification dès le RUN-02) ; elles pèsent ≈ 187 kB (store, kv, Radix) et resteront mesurées dans les rapports.
- **Non fait** : `tailwind-merge` (8,6 kB gzip) reste dans `/reserver` et `/admin` (les composants clients appellent `cn()`), l'alléger ferait perdre la fusion des classes ; `next/image` n'est pas remplacé par `<img>` (les dépôts clients y mettront des photos AVIF/WebP, `STANDARDS.md` §7).
- **Alternatives** : garder le store dans le layout racine (+9 kB sur `/`, aucun risque de perte d'état) ; déférer par `ssr: false` (interdit dans un composant serveur, et supprimerait le texte du serveur).
- **Statut** : **ACCEPTÉ** (Yass, RUN-P).

---

## Décisions du RUN-P (apps de démonstration pour la présentation)

### ADR-041 — Persistance de l'état de la démo dans `sessionStorage`
- **Contexte** : le store de la démo (ADR-030, ADR-040) vivait en mémoire React dans le layout `(app)` : un détour par l'accueil ou un rechargement remettait les données seed, donc une réservation faite sur `/reserver` disparaissait du back-office pendant une présentation.
- **Décision** : `src/core/state/persist.ts` écrit un instantané JSON (réservations, clients, salles, équipe, site du back-office) dans `sessionStorage` à chaque changement, après l'hydratation, et le relit au montage du store. Tout accès est enveloppé dans un `try/catch` ; repli sur une copie en mémoire du module quand le stockage est bloqué (navigation privée, quota). L'instantané est lié à la **date du jour** (les dates du seed sont relatives à la semaine en cours : le lendemain on repart du seed), à une **version** de format et à une **clé propre à la marque** (`<préfixe>-demo-state`). Un instantané absent, périmé ou corrompu est ignoré sans erreur. Bouton **« Réinitialiser la démo »** (barre latérale et tiroir mobile du back-office, avec confirmation) : efface l'instantané et repart du seed.
- **Pourquoi `sessionStorage`** : propre à l'onglet, vidé à la fermeture de l'onglet, donc aucune donnée ne s'accumule ni ne se partage entre présentateurs sur un même poste ; rien ne quitte le navigateur (aucune donnée réelle, tout est FICTIF ou saisi pour la démo).
- **Alternatives** : `localStorage` (survit à la fermeture : un poste partagé garderait les réservations de la présentation précédente) ; remonter le store dans le layout racine (+9 kB sur l'accueil, ADR-040).
- **Conséquences** : le store reste un état de démo ; aucune donnée personnelle saisie dans la démo n'est envoyée à un serveur. Test unitaire (`tests/core/persist.test.ts`, 6 cas dont stockage bloqué) et e2e (réservation → accueil → admin → rechargement → réinitialisation, à 375 et 1280 px).
- **Statut** : **À VALIDER**.

### ADR-042 — Personnalisation par la marque : vocabulaire, logo, pictogrammes, mention de pied de page
- **Contexte** : une app cliente ne modifie que `src/brand/`, `public/brand/`, `brand.config.ts`, le seed et les métadonnées (jamais `src/core` ni `src/ui`). Or le socle écrivait en dur « soin », « praticien », un logo SVG unique, une mention « Marque fictive » et une rotation fixe de pictogrammes : un barbershop affichait « Réserver un soin ».
- **Décision** : (1) `src/brand/copy/vocab.ts` exporte `vocab` (type `Vocabulary`) : mots de base (service / soin, praticien / barbier, pluriels et capitales dérivés) et six phrases d'accueil et de tunnel ; `src/ui` et `src/core` lisent `vocab` et n'écrivent plus ces mots (26 fichiers) ; (2) `BrandConfig` gagne `logoImage` (logo complet, plaque claire en thème sombre), `logoMark` (pastille image + wordmark texte) et `footerNote` ; (3) `FeaturedCare.icon` choisit le pictogramme des prestations vedettes parmi huit.
- **Conséquence** : tout ce qui change d'une marque à l'autre passe par `src/brand/`. Une évolution du socle reste mergée par `git merge upstream/main`.
- **Alternatives** : bibliothèque d'i18n (interdit en v1, STANDARDS §7) ; modifier `src/ui` dans chaque app (conflits de merge permanents).
- **Statut** : **À VALIDER**.

### ADR-043 — Plan allégé
- **Contexte** : la présentation au client a lieu le soir même ; le contrat est signé et le plan v1.1 comptait 18 runs. Yass demande un plan allégé : apps de démonstration d'abord, puis trois runs de fond.
- **Décision** : `docs/PLAN.md` §5 est remplacé par RUN-P (apps + staging), RUN-A (PostgreSQL, Drizzle, authentification, rôles, audit, CI), RUN-B (référentiel, catalogue, agenda serveur, réservation publique persistante, acompte manuel, « Gérer mon RDV »), RUN-C (back-office des réservations, clients, WhatsApp N1, notifications par polling, sauvegarde, en-têtes, runbook), plus une section **« Reporté en maintenance »** (RLS, pg-boss / worker, SSE, PWA / push, rôles `comptable` et `support_tech`, caisse, fidélité, stock, RH, rapports, WhatsApp Cloud API, walk-in, réservation groupée). Après chaque run A, B ou C : `git merge upstream/main` dans les deux apps.
- **Conséquences** : les STANDARDS qui mentionnent RLS, pg-boss, SSE ou PWA décrivent la cible complète ; ce qui est reporté l'est explicitement. Les rôles du RUN-A sont `super_admin`, `gerante`, `reception`, `praticien` (portée par site).
- **Statut** : **ACCEPTÉ** (consigne de Yass pour le RUN-P).

### ADR-044 — Tests du socle indépendants de la marque ; e2e pilotés par la marque
- **Contexte** : les tests du socle (planification, KPI, exports, WhatsApp) lisaient le seed d'OVAGLOW (`site-aurore`, « Soin Lumière », `OVG-`) ; l'e2e contenait des noms en dur. Dans une app cliente, qui remplace la marque, ces tests auraient échoué, et les modifier aurait créé des conflits à chaque merge de la souche.
- **Décision** : `tests/core/fixture-brand/` est une copie figée du seed de référence (neutre : « MARQUE-TEST », préfixe `TST`) utilisée par `tests/core/fixtures.ts` ; seul `seed.test.ts` lit la marque réelle (invariants du seed : références valides, aucun chevauchement, cinq statuts, historique par client). `e2e/brand-data.ts` dérive de `brand.config` et de `vocab` les noms que les scénarios utilisent ; la liste des noms interdits (anti-fuite et e2e) est `src/brand/forbidden-names.json`, propre à chaque dépôt. La CI de la souche et celles des apps sont ainsi identiques.
- **Conséquence** : un seed de marque doit respecter les invariants de `seed.test.ts` ; sinon la CI de l'app échoue (voulu).
- **Statut** : **À VALIDER**.

### ADR-045 — Dérivation des apps depuis `demo-v0.1` et publication GHCR
- **Contexte** : le plan (ADR-003) prévoyait « historique propre » à la création des apps, avant un `git merge upstream/main`. Or un merge de la souche exige un ancêtre commun.
- **Décision** : chaque app est créée **avec l'historique de la souche**, à partir du tag `demo-v0.1` (remote `upstream` = souche, push sur `main` de l'app). L'historique est ré-écrit à la cession (déjà prévu au PLAN §2). Chaque app ajoute `.github/workflows/release.yml` : sur `main`, build de l'image et push vers `ghcr.io/nothineazi/<dépôt>` (tags `latest` et SHA du commit), avec `GITHUB_TOKEN` et la permission `packages: write`. `CI` identique à la souche. `git diff upstream/main -- src/core` reste vide.
- **Alternatives** : historique propre (merges ultérieurs impossibles sans ancêtre commun) ; image construite sur le serveur (interdit : ADR-018).
- **Statut** : **À VALIDER**.
