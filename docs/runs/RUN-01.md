# RUN-01 — Création de la souche OVAGLOW et migration Next.js 16

Branche `run/01-souche-next16` · base `main` · 2026-10-08. Documents liés : `RUN-01-baseline.md`, `RUN-01-inventaire.md`, `docs/DECISIONS.md` (ADR-019 à 034).

## 1. Fait / non fait

| Étape | Résultat |
|---|---|
| 0. Lecture (CLAUDE.md, STANDARDS, PLAN, cadrage) | Fait. Le cadrage est sur une branche de la démo, pas sur `main` (voir écarts). |
| 1. Base de référence | Fait : `RUN-01-baseline.md` (45 tests, routes, First Load JS, versions). |
| 2. Inventaire | Fait : 139 fichiers classés (a) 80 · (b) 12 · (c) 28 · (d) 19. |
| 3. Import propre | Fait : commit `chore(core): import depuis mahaza-demo@656cfc7` (99 fichiers). |
| 4. Suppression du legacy | Fait : aucun aiguillage de thème, `NEXT_PUBLIC_THEME` retiré. |
| 5. Rebrand OVAGLOW | Fait : tokens clair et sombre, contrastes par script, wordmark, SVG, données FICTIVES, bandeau, liens WhatsApp sans destinataire, anti-fuite (npm + CI). |
| 6. Restructuration | Fait : `src/{app,core,brand,ui}`, `brand.config.ts` (fonctionnalités à `false`, politiques). Pas de base de données. |
| 7. Next.js 16 | Fait : 16.4.0 par le codemod officiel, guide embarqué lu, ESLint flat natif, ADR de versions. Smoke Playwright 375 et 1280 px vert. |
| 8. Performance et image | **Partiel** : CLS = 0 ; image construite, démarrée, `/api/health` 200, `healthy` ; **First Load JS > base** (voir §4). |
| 9. CI minimale | Fait : `.github/workflows/ci.yml`. **Non vérifiée sur GitHub** : elle ne s'exécutera qu'à l'ouverture de la PR (voir §6). |
| 10. Documentation | Fait : README, ARCHITECTURE, DECISIONS, SECURITY, CHANGELOG. `RUNBOOK.md` n'est pas dû avant L0.6. |

Non fait : critère « First Load JS ≤ base » (impossible sous Next 16, §4) ; centralisation des textes par module (ADR-031) ; protection de `/admin` (RUN-02/03).

## 2. Écarts au plan

1. **Cadrage introuvable sur `main`** de `mahaza-demo` : `docs/refonte-1-cadrage.md` n'existe que sur la branche `claude/vibrant-feynman-ndb0h5`. Lu depuis cette branche, jamais copié.
2. **Jeu de données FICTIF écrit à l'étape 3** et non à l'étape 5, pour que l'import reste testable (ADR-029). Les tests ont été adaptés (identifiants de sites, services, horaires).
3. **Anti-fuite** : périmètre « tout sauf `docs/` et `CLAUDE.md` » au lieu de « hors `docs/runs/` », car les fichiers de référence nomment les dépôts clients (ADR-026). Le contrôle a détecté deux fuites réelles pendant le run (CHANGELOG, budget), corrigées.
4. **Illustrations dans `public/brand/`** et non `src/brand/assets/` (ADR-028).
5. **Rendu à la demande** de toutes les pages (APP_ENV lu à l'exécution), ce qui supprime le prérendu statique (ADR-025).
6. **Liens WhatsApp sans destinataire hors production** (et pas seulement en staging).
7. **Ajouts hors plan** : jobs `e2e` et `docker` dans la CI (ADR-033), Playwright et axe (ADR-023), thème sombre (ADR-027), budget de poids en CI.
8. **Branche** : le travail est sur `run/01-souche-next16` comme demandé ; l'environnement désignait aussi `claude/cool-newton-uzd0ea` (voir §6).
9. **Docker dans la sandbox** : `dockerd` démarré à la main (réseau hôte, proxy et CA injectés dans une copie locale du Dockerfile). Le `Dockerfile` committé est celui de la CI.

## 3. Décisions À VALIDER

ADR-019 (Node 22 au lieu de 24) · 023 (Playwright, axe) · **024 (budget de poids)** · 025 (APP_ENV, rendu dynamique) · 026 (périmètre anti-fuite) · 027 (thèmes clair/sombre, palette teal et laiton) · 028 (assets dans `public/brand/`) · 029 (jeu FICTIF) · 030 (store transitoire) · 031 (textes non centralisés) · 032 (cartes cadeaux simulées) · 033 (jobs e2e/docker) · 034 (Turbopack).

## 4. Résultats

### Tests (chiffres)

| Contrôle | Résultat |
|---|---|
| Typecheck (`tsc`) | 0 erreur |
| Lint (`eslint .`, flat config) | 0 erreur |
| Vitest | **49 / 49** (45 de la démo adaptés + 4 sur `APP_ENV` et les liens WhatsApp) |
| Playwright (375 et 1280 px) | **12 / 12** (6 scénarios × 2 largeurs), 2 passes consécutives vertes à l'étape 7 |
| axe-core (WCAG 2.x A/AA) | 0 violation sérieuse ou critique : accueil clair et sombre, confirmation de réservation, tableau de bord |
| Contrastes WCAG AA | **48 couples par thème**, 0 échec (clair et sombre) |
| Anti-fuite de marque | 0 occurrence (127 fichiers) |
| Débordement horizontal (375 et 1280 px) | 0 sur les 8 pages |
| CLS | **0,0000** sur `/`, `/reserver`, `/admin` à 375 et 1280 px |
| `npm ci` depuis zéro | OK (`package-lock.json` committé) |
| Image Docker | build ≈ 75 s, **235 Mo**, démarrage OK, `/api/health` 200, `healthy`, utilisateur non-root, système de fichiers en lecture seule, bandeau présent en `staging`, absent en `production` |
| Postgres | Sans objet (aucune base au RUN-01) |

Scénarios e2e : accueil (marque, bandeau, catalogue FICTIF, stabilité) ; axe clair/sombre ; réservation multi-soins du choix du site à la confirmation (numéro « FICTIF – ne pas payer », `.ics`, lien WhatsApp sans destinataire, simulation de confirmation) ; back-office (tableau de bord, planning, réservations avec export CSV, clients, salles, équipe) ; `/api/health`.

Défauts trouvés par ces tests et corrigés : infobulle du graphique qui débordait à 1280 px, bouton « Générer ma carte cadeau » qui débordait à 375 px, cartes du tableau de bord sans `min-w-0`.

### Mesures : First Load JS (kB gzip)

Méthode : somme des scripts de la page (hors `nomodule`), gzip niveau 9. Validée sur la base : 143,1 et 169,7 mesurés pour 142 et 168 affichés par Next 15.

| Route | Base `mahaza-demo` (Next 15.5.27) | **Même code OVAGLOW, Next 15.5.27** | **OVAGLOW, Next 16.4.0 (Turbopack)** | Budget CI |
|---|---:|---:|---:|---:|
| `/` | 142 | 139,6 | **171,0** | 175 |
| `/reserver` | 168 | 156,0 | **187,6** | 192 |
| `/admin` | 156 | 154,0 | 183,3 | – |
| `/admin/clients` | 150 | – | 182,6 | – |
| `/admin/planning` | 150 | – | 182,4 | – |
| `/admin/reservations` | 154 | – | 182,3 | – |
| `/admin/salles` | 149 | – | 179,3 | – |
| `/admin/staff` | 149 | – | 179,4 | – |
| `/_not-found` (framework seul) | 104 | 104 | 144,1 | – |

**Le critère « ≤ base » n'est pas tenu sous Next 16.** Preuve : le même code pèse 139,6 / 156,0 kB sous Next 15 (sous la base : le code applicatif est plus léger que celui de la démo), et 171,0 / 187,6 kB sous Next 16. Le surcoût (+31 kB) est celui du runtime : la route `/_not-found`, qui ne contient que le framework, passe de 104 à 144 kB, soit plus que la base de `/` (142). Webpack (`--webpack`) donne 169,5 / 185,3 kB ; retirer le provider du layout ne gagne que 4 kB. Aucune réduction du code applicatif ne suffit donc. Décision à prendre (ADR-024) : accepter la nouvelle base, ou planifier un allègement ciblé (chargement différé, scission du store) dès le RUN-04. Un budget de non-régression (175 / 192 kB) est contrôlé en CI en attendant.

Poids brut de l'image : 235 Mo. Mémoire d'exécution : non mesurée (RUN-04).

## 5. Revues avant push

- **Simplification** (4 relectures en parallèle : réutilisation, simplification, efficacité, altitude), appliquée : un seul constructeur de lien `wa.me` (`giftCardWaLink` délègue à `whatsappLink`) ; UID de l'`.ics` dérivé de la marque (plus de nom codé en dur dans `src/core`) ; code mort retiré (`whatsappButtonClass`, `hoursLabel`, `@eslint/eslintrc`) ; infobulle du graphique positionnée relativement à la longueur de la série ; motif anti-fuite des e2e aligné sur le script ; commentaires obsolètes. **Non appliqué** (noté) : `recipientless` échoue « ouvert » dans `whatsappLink` (le fournisseur de contexte, lui, échoue « fermé ») et passe par les appelants — à durcir quand le routage WhatsApp sera réécrit (RUN-09) ; bouton `Button` en `whitespace-nowrap` forcé (contournement local) ; caches CI (`.next/cache`, Chromium) et artefact de build partagé entre jobs ; dérivation de `schedule` depuis `opening`.
- **Revue de sécurité** (le run n'est pas « sensible » : ni auth, ni RLS, ni acompte réel, ni lien client, ni donnée de santé) : aucun `dangerouslySetInnerHTML`, `innerHTML`, `eval` ; liens `target="_blank"` tous en `rel="noopener noreferrer"` ; `process.env` lu à un seul endroit (`APP_ENV`, valeur inconnue → `development`, donc bandeau et liens sans destinataire) ; CSV : formules neutralisées (testé) ; `.ics` : échappement et pliage testés ; liens WhatsApp : message encodé, aucun numéro réel. Pas de tests d'attaque IDOR/rejeu : il n'y a ni backend ni identifiant de ressource.
- **Scan de secrets** : gitleaks 8.30.1 sur l'historique (15 commits) : **aucune fuite**. Sur l'arbre de travail, 13 faux positifs, tous dans `.next/` (fichiers générés par Next, ignorés par Git, jamais committés). Recherche manuelle de motifs de secrets dans le code : rien. Gitleaks en CI viendra au RUN-03.
- **`npm audit`** : 10 alertes (3 modérées, 7 élevées), toutes dans la chaîne de build Tailwind 3 et ESLint ; triage dans `docs/SECURITY.md`. L'alerte PostCSS portée par Next 15 est corrigée par Next 16. Aucun `--force`.

## 6. Risques ouverts

1. **CI non exécutée** : écrite et validée localement commande par commande, mais jamais lancée sur GitHub Actions. Les versions d'actions (`checkout`, `setup-node`, `upload-artifact` en v6) ont été relevées sur les étiquettes publiques. Un premier échec de la PR est possible (installation de Chromium, délai de démarrage de l'image) : à corriger dans la PR.
2. **Budget de poids** (ADR-024) : décision à prendre.
3. **Node 22 ou 24** (ADR-019) : à trancher avant le RUN-02.
4. **`/admin` sans authentification** : acceptable tant que la souche n'est pas déployée (RUN-02/03).
5. **Build dépendant de Google Fonts** (`next/font/google`) : un build sans réseau échoue.
6. **Chaîne Tailwind 3** : 10 alertes de build acceptées ; Tailwind 4 = montée majeure (ADR + GO).
7. **Rendu à la demande** de toutes les pages : à surveiller sur le KVM partagé (RUN-04).
8. **Cartes cadeaux simulées** visibles sur l'accueil (ADR-032).
9. **Branche de travail** : voir l'écart 8 ; la PR part de `run/01-souche-next16`.

## 7. Prochain run : RUN-02 — base de données et authentification

À préparer par Yass (uniquement quand le run démarre) :
- Docker Desktop installé (pour `docker-compose.dev.yml`, PostgreSQL local) ;
- aucun secret requis avant l'implémentation de Better Auth ; le run demandera un secret de session (`BETTER_AUTH_SECRET`) et les identifiants du premier super admin, avec guide pas à pas en PowerShell ;
- décisions : ADR-019 (Node), ADR-024 (budget), ADR-032 (cartes cadeaux).
