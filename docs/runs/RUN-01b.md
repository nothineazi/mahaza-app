# RUN-01b — Fondations design et outillage

Branche `run/01b-design-outillage` · base `main` (PR du RUN-01 mergée, `3bb0ac9`) · 2026-10-08. Documents liés : `docs/DECISIONS.md` (ADR-019, 024, 035 à 040), `docs/reference/factory-core.md`, `RUN-01b-contrastes.md` (80 → 79 couples × 2 thèmes).

## 1. Fait / non fait

| Étape | Résultat |
|---|---|
| Décisions de Yass sur le RUN-01 | Fait : ADR-019 **REFUSÉ → Node 24** ; 024 **ACCEPTÉ provisoirement** puis **REMPLACÉ** (ADR-040) ; 027 **REMPLACÉ** (ADR-036) ; 032 ACCEPTÉ ; 022 REMPLACÉ (ADR-035) ; 023, 025, 026, 028 à 031, 033, 034 ACCEPTÉS. |
| 1. Node 24 LTS | Fait : `.nvmrc`, `engines` (`>=24 <25`), Dockerfile, CI (lit `.nvmrc`), `@types/node` 24. Calendrier officiel lu dans `nodejs/Release` : Node 24 « Krypton » LTS depuis 2025-10-28, maintenance 2026-10-20, **fin de vie 2028-04-30** ; Node 22 : 2027-04-30 ; Node 26 : LTS le 2026-10-28. `npm ci` depuis zéro, tests, build, image Docker OK. |
| 2. Tailwind 3 → 4.3.3 | Fait (outil officiel `@tailwindcss/upgrade` + reprise). Rendu public **identique** : 32 captures (accueil, réservation, 6 écrans admin × 375 / 1280 px × clair / sombre) comparées pixel à pixel ; seul écart : la pastille « Active » reçoit son fond vert voulu (`bg-success/12`, ignoré par Tailwind 3). `npm audit` : 10 → 5 alertes. |
| 3. Couche design factory | Fait (ADR-036, 037) : deux registres, jetons OKLCH (H = 200), échelle `kv` + surcharge mobile, graisses, rayons, hauteurs, `next-themes` (classe `.dark`, défaut système) + bouton, `color-scheme`, composants `src/ui/kv`, `cn()` étendu (testé), coque à barre latérale, `check-design --strict` en CI, contrastes recalculés par script (79 couples × 2 thèmes). |
| 4. Polices | Fait (ADR-038) : Inter, Cormorant Garamond, JetBrains Mono, `next/font/local`, OFL versionnées, sous-ensemble latin, 4 fichiers (≈ 133 Ko), plus de `next/font/google` ; build vérifié avec un proxy volontairement mort. |
| 5. Écrans admin | Fait : planning, réservations, clients, salles, équipe, export CSV **et tableau de bord** (ajouté : il est dans le périmètre de `check-design --strict`). États vide / chargement (squelettes aux dimensions mesurées) / erreur (`error.tsx`, `loading.tsx`). Fiche de réservation : matrice statut → action primaire (ADR-039). Pas de glisser-déposer. |
| 6. Allègement | Fait (ADR-040) : analyse chiffrée de `/_not-found`, store hors de l'accueil (groupe de routes `(app)`), cartes cadeaux et étapes tardives du tunnel en chargement différé, nouvelle mesure, budget CI 149 / 172 kB. |
| 7. Documentation | Fait : STANDARDS §1, §2, §7, §8, §11 ; PLAN (RUN-01b inséré, RUN-04 allégé) ; README, ARCHITECTURE, DECISIONS, SECURITY, CHANGELOG. |

Non fait (voulu) : FR + EN, copy et valeurs Koverit, page de paiement, Copilot, PWA, graphiques (hors périmètre, ADR-036) ; `DataTable.select`, `actions`, `rowAccent` sont implémentés mais **aucun écran ne s'en sert encore** (API de la factory conservée pour le RUN-08).

## 2. Écarts au plan

1. **Branche** : l'environnement désignait `claude/ecstatic-cray-h1y8p4` ; le travail est sur `run/01b-design-outillage`, comme demandé dans la consigne du run.
2. **Tableau de bord** migré en plus des cinq écrans listés (nécessaire au périmètre strict).
3. **Coque à barre latérale** (factory §5.9) construite à l'étape 3 : elle porte le bouton de thème demandé.
4. **Deux jetons renommés** : le laiton du site public devient `gold` (le nom `accent` prend le sens factory) ; le filet décoratif public est `line` ; `--border` devient le filet fort ≥ 3:1 (ADR-036).
5. **`tw-animate-css`** remplace `tailwindcss-animate` (plugin v3 non maintenu) ; `next-themes` 0.4.6 ajouté (demandé).
6. **Tests e2e** : le menu du back-office est un tiroir sous 768 px (helper `adminNav`), l'assertion « fond sombre = rgb(14, 21, 21) » devient « classe `.dark` sur `<html>` » ; 13 scénarios ajoutés (voir §4).
7. **Interlignes** : 5 éléments reçoivent `sm:leading-*` pour garder le rendu de Tailwind 3 (en v4 `leading-*` l'emporte sur le `sm:text-*` suivant).
8. **Italiques supprimés** (message de carte cadeau, note d'horaires) et `font-mono` retiré du site public, pour ne charger aucun fichier de police inutile.
9. **Docker dans la sandbox** : `dockerd` démarré à la main, réseau hôte, proxy et CA injectés dans une copie locale du Dockerfile (celui de la CI est inchangé hormis `node:24-alpine`).

## 3. Décisions À VALIDER

**ADR-036** (couche design : deux registres, jetons, fond du site public qui passe du crème au gris-teal neutre de la recette, sombre plus profond) · **037** (tons des statuts) · **038** (polices) · **039** (matrice statut → action primaire) · **040** (allègement : le store repart des données seed si l'on passe par l'accueil ; nouveau budget).

## 4. Résultats de tests

| Contrôle | Résultat |
|---|---|
| Typecheck, lint | 0 erreur, 0 avertissement |
| Vitest | **55 / 55** (49 au RUN-01 ; +6 : `cn` étendu ×3, polices auto-hébergées ×2, sens des jetons du site public ×1) |
| Playwright (375 et 1280 px) | **25 / 25** (12 au RUN-01) : accueil, axe clair / sombre, réservation multi-soins, back-office (6 écrans + export CSV), **fiche de réservation** (action primaire, menu, Échap), **formulaire de salle**, **axe des 6 écrans en clair et en sombre**, **bascule de thème mémorisée**, **cartes cadeaux chargées à l'approche**, **feuille mobile du récapitulatif** (test mobile seul), sonde de santé. Passes consécutives vertes. |
| axe (WCAG 2.x A/AA) | 0 violation sérieuse ou critique : accueil, 6 écrans admin et fiches, clair et sombre |
| Contrastes AA | **79 couples par thème, 0 échec** (OKLCH, transparences composées) |
| `check-design --strict` | 37 fichiers, **0 violation**, 11 exceptions déclarées (toutes `style-inline` : positions et largeurs calculées du planning et des jauges). Base de départ : 130 violations (11 / 0 / 0 / 75 / 8 / 31 / 0 / 5) |
| Anti-fuite de marque | 0 occurrence (167 fichiers) |
| Console navigateur (build de production, 8 pages) | aucun message d'erreur ni d'avertissement |
| CLS (défilement complet de l'accueil) | **0,0000** à 375 et 1280 px ; gabarit des cartes cadeaux = hauteur réelle à 375 et 1280 px |
| `npm ci` depuis zéro | OK, `package-lock.json` committé |
| Image Docker | build OK, démarrage OK, `/api/health` 200, bandeau présent, Node v24.21.0, utilisateur 1000 (non-root), **326 Mo** (`docker image ls`, base `node:24-alpine` ; 235 Mo au RUN-01 sous Node 22 : écart non investigué, la mesure n'était pas détaillée) |
| Postgres | Sans objet (aucune base avant le RUN-02) |

## 5. Mesures

### First Load JS (kB gzip, `scripts/measure-first-load.mjs`)

| Route | Base Next 15 | RUN-01 | Fin d'étape 5 | **Après allègement** | Budget CI | Ancien budget |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 142 | 171,0 | 172,4 | **146,9** | **149** | 175 |
| `/reserver` | 168 | 187,6 | 188,7 | **169,6** | **172** | 192 |
| `/_not-found` | 104 | 144,1 | 145,4 | **136,5** | – | – |
| `/admin` | 156 | 183,3 | 187,3 | 187,6 | – | – |
| `/admin/clients` | 150 | 182,6 | 187,7 | 188,0 | – | – |
| `/admin/planning` | 150 | 182,4 | 186,2 | 186,5 | – | – |
| `/admin/reservations` | 154 | 182,3 | 187,5 | 187,8 | – | – |
| `/admin/salles` | 149 | 179,3 | 183,3 | 183,6 | – | – |
| `/admin/staff` | 149 | 179,4 | 183,4 | 183,7 | – | – |

Tailwind 4 seul : `/` 171,0 · `/reserver` 187,6 · admin inchangé (poids JS identique). La couche design (kv, thème, polices) ajoute ≈ 1,4 kB sur les routes publiques et ≈ 4 kB sur l'admin ; l'allègement retire 25,5 kB sur `/` et 19,1 kB sur `/reserver`.

### Écart de `/_not-found` (104 → 144 kB) : framework ou application ?

| Application vide (layout + une page de texte) | kB gzip |
|---|---:|
| Next 15.5.27 | **103** |
| Next 16.4.0 + React 19.3.0 | **134,7** (+31,7) |
| OVAGLOW `/_not-found` avant allègement (Next 16) | 144,1 |
| OVAGLOW `/_not-found` après allègement | **136,5** |

Conclusion chiffrée : sur les **+40,1 kB** observés au RUN-01, **31,7 kB (79 %) viennent du framework** (Next 16 + React 19.3 : aucun code applicatif ne peut les retirer) et **8,4 kB (21 %) du code applicatif** du layout racine (store de la démo, données seed, moteur de planification). Ces 8,4 kB sont supprimés : `/_not-found` est à 1,8 kB du plancher de Next 16. Le plancher de Next 16 (134,7) est lui-même **au-dessus** de la base de `/` sous Next 15 (142) moins le code de page : l'écart restant de `/` (+4,9 kB) et de `/reserver` (+1,6 kB) est donc quasi incompressible.

### Autres mesures
- Polices : 47 + 2 × 23 Ko préchargées sur le site public (93 Ko) ; JetBrains Mono (40 Ko) jamais téléchargée par les pages publiques.
- CSS : 75,8 Ko brut (1 fichier) ; mémoire d'exécution : non mesurée (RUN-04).

## 6. Revues avant push

- **Simplification** (`/simplify`, 4 agents en parallèle : réutilisation, simplification, efficacité, altitude), appliquée : **contour de focus global et dégradé des squelettes réparés** (`rgb(var(--x))` devenu invalide avec les jetons OKLCH) ; classe `.kv-app` posée sur les surfaces portées (fiche, tiroir) au lieu d'un effet sur `<body>` (ADR-036 mis à jour) ; aides partagées (`whenIdle`, `norm`, `serviceNames` / `staffNames`, `DeleteConfirm`, `LoadingRegion`) ; compteurs de réservations en une passe, colonnes mémoïsées ; notes client isolées (la frappe ne refait plus l'historique) ; `LazyOnVisible` en un seul effet ; préchargement de la feuille mobile limité aux écrans < 1024 px ; `check-design` : exception limitée au motif nommé ; test des noms de jetons du site public ; code mort supprimé (`hexToChannels`).
- **Revue de code** (`/code-review`, niveau medium) : **Échap dans le menu d'actions fermait aussi la fiche** (le test d'origine ne le détectait pas) → corrigé à la source (`onEscapeKeyDown` de la fiche) et test renforcé ; lien désactivé jamais cliquable ; `error.tsx` du tunnel de réservation (étape non téléchargée) ; plus de gabarit éternel après un échec de chargement. Vérifié à tort signalé : `retry` est bien la prop de `error.tsx` en Next 16.4 (doc embarquée lue).
- **Non appliqué (noté)** : `DataTable` rend chaque ligne deux fois (cartes mobiles et tableau, commutés en CSS : choix de la factory) ; tic d'une seconde du tableau de bord (hérité) ; images du hero toutes téléchargées d'emblée (hérité) ; libellé accessible des cases de sélection de `DataTable` (aucun écran ne s'en sert) ; remplacer `sm:leading-*` par la forme `text-5xl/none` ; simplifier `DestructiveMenu` en un simple bouton (changerait l'UX documentée) ; `rowAccent` sur `<tr>` en tableau fusionné (inutilisé).
- **Sécurité** (run non sensible : ni auth, ni RLS, ni acompte, ni lien client, ni donnée de santé) : relecture ligne à ligne des ajouts contre `STANDARDS.md` §4–§6 : aucun `dangerouslySetInnerHTML`, `innerHTML`, `eval` ; liens externes en `rel="noopener noreferrer"` ; aucune entrée utilisateur dans un import dynamique ; pas de secret ; suppression d'une salle ou d'un praticien confirmée ; l'import `next/font/google` ne peut pas revenir (test). Détail : `docs/SECURITY.md` §5.
- **Scan de secrets** : gitleaks 8.30.1 sur l'historique (24 commits) : **aucune fuite** ; sur l'arbre de travail, 13 faux positifs, tous dans `.next/` (généré, ignoré par Git). Recherche manuelle de motifs de secrets dans les fichiers suivis : rien.
- **`npm audit`** : 5 alertes élevées, toutes la chaîne de lint (`braces` ← `micromatch` ← `fast-glob` ← `@next/eslint-plugin-next` ← `eslint-config-next`), triées dans `docs/SECURITY.md` §2. Aucun `--force`.

## 7. Risques ouverts

1. **Fond du site public** : crème → gris-teal neutre (recette factory). À valider visuellement (4 combinaisons).
2. **Store transitoire** : repart des données seed si l'on passe par l'accueil entre `/reserver` et `/admin` (une réservation créée disparaît alors du back-office). Disparaît avec les services serveur du RUN-02.
3. **`next-themes`** injecte un `<script>` en ligne : la CSP du RUN-04 devra le couvrir (nonce).
4. **Interrupteurs et chargements différés** : sur réseau très instable, une étape du tunnel non téléchargée affiche l'écran d'erreur (réessayer) ; une section d'accueil non chargée affiche un message.
5. **`check-design`** analyse ligne à ligne : il ne voit pas les classes construites par concaténation ; une règle ESLint serait plus fine (à envisager).
6. **Bordure des cartes en sombre** : 1,70:1 (décorative, comme la factory) ; les champs sont à 3,54:1.
7. **`/admin` toujours sans authentification** (RUN-02 / RUN-03) ; **5 alertes `npm audit`** d'outil de lint.
8. **Image Docker** : 326 Mo, écart avec les 235 Mo du RUN-01 non expliqué.

## 8. Prochain run : RUN-02 — base de données et authentification

À préparer par Yass (uniquement quand le run démarre) : Docker Desktop (PostgreSQL local via `docker-compose.dev.yml`) ; aucun secret avant Better Auth, puis `BETTER_AUTH_SECRET` et les identifiants du premier super admin (guide PowerShell au moment voulu). Les écrans de connexion, d'activation et de sessions réutiliseront `src/ui/kv` (formulaires `Field`, `StateBlock`, `ActionBar`).
