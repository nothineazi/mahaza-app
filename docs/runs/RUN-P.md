# RUN-P — mahaza-app : version de démonstration pour la présentation

Dépôt `nothineazi/mahaza-app` · `main` créé depuis le commit `ceb8b71` de la souche (merge de la PR #3 ; le tag `demo-v0.1` n'a pas pu être poussé par l'agent, voir la souche) **avec l'historique** (remote `upstream` = `ovatech-spa-core`) · 2026-10-09. Contrastes détaillés : `RUN-P-contrastes.md`. Déploiement : `docs/RUNBOOK.md`.

## 1. Fait / non fait

| Élément | Résultat |
|---|---|
| Création depuis la souche avec historique, remote `upstream` | Fait. `git diff upstream/main -- src/core src/ui` : **vide**. |
| Seuls `src/brand/`, `public/brand/`, icône, métadonnées (`package.json`), README, CHANGELOG modifiés | Fait (voir `git diff upstream/main --stat`). |
| Anti-fuite adapté | Fait : `src/brand/forbidden-names.json` interdit « ovaglow » et « st louis » (hors `docs/` et `CLAUDE.md`) ; 0 occurrence (174 fichiers). |
| Identité premium reprise de `mahaza-demo` | Fait : or du logo (`#E9B93C`), charbon, crème, fleur saumon (visuels) ; convertie en jetons OKLCH selon la recette factory (neutres teintés, teinte 80) ; texte et boutons en **bronze** dérivé de l'or (`oklch(0.45 0.09 80)` ≈ `#6F4F07`, texte sur crème) ; en sombre, l'or lui-même sert d'accent. |
| Logo et médias de l'ancien site | Fait : logo PNG (151 × 51, taille native, posé sur une plaque claire en thème sombre), photos converties en WebP (mêmes dimensions ; 2,2 Mo → 0,12 Mo), icône d'application (`src/app/icon.png`). |
| Contrastes vérifiés par script dans les deux thèmes | Fait : **79 couples × 2 thèmes, 0 échec** (`npm run check:contrast`), extraits : texte courant 14,91 (clair) / 18,86 (sombre) ; texte atténué sur carte 6,03 / 7,29 ; or sur surface inversée ≥ 4,5. |
| Données réelles autorisées | Utilisées : le nom de la marque, les **5 noms de sites** (Douala Bonapriso, Douala Yassa, Yaoundé Bastos, Yaoundé Dragage, Best Western Airport), les **8 catégories et 54 noms de soins** de l'ancien site. |
| Tout le reste FICTIF et marqué | Fait : prix (barème déterministe), durées (créneaux indicatifs de 60 min), adresses (« Adresse fictive (à confirmer) »), numéros (MoMo `6 00 00 00 00`, WhatsApp, téléphones des clients `+237 600 00 00 NN`, tous « FICTIF – ne pas payer »), horaires (« à confirmer par site »), 30 membres du personnel (initiales), clients et réservations (badge « FICTIF »). Aucun avis, aucun KPI présenté comme réel. |
| Cartes cadeaux Mahaza (simulation marquée) | Fait : palier de 20 000 à 100 000 FCFA (fourchette de l'ancien site, pas FICTIF à confirmer), texte « simulation FICTIVE, aucune carte n'est réellement émise ni payée », code `GC-…`, « FICTIF – ne pas payer ». |
| `ci.yml` identique à la souche | Fait (aucune modification). |
| `release.yml` : image `ghcr.io/nothineazi/mahaza-app`, tags `latest` + SHA, `GITHUB_TOKEN`, `packages: write` | Fait ; build, test (`APP_ENV=staging`, health, bandeau, pas de lien WhatsApp avec numéro, non-root) puis publication. |
| Image testée | Fait (voir §4). |
| `docs/RUNBOOK.md` Dokploy pas à pas | Fait. |
| Réseaux sociaux et e-mail réels de l'ancien site | **Non repris** (hors périmètre autorisé : seuls les noms de sites et de soins sont réels) : e-mail `contact@mahaza-demo.invalid`, aucun lien de réseau social. |

## 2. Écarts au plan

1. Photos : le hero 2 et l'« à propos » montrent des **personnes reconnaissables** (photos de l'ancien site, reprises sur consigne). STANDARDS §9 interdit les visages reconnaissables pour les images générées ou libres ; ici ce sont les médias du client. **Droits et consentements à confirmer** avant toute mise en production.
2. Photos servies en WebP (conversion locale, qualité 78-84) au lieu des PNG d'origine, pour le poids ; l'optimiseur `next/image` (AVIF/WebP) reste actif.
3. `npm run assets:generate` est neutralisé dans cette app (aucun visuel généré).

## 3. Décisions À VALIDER (ce run)

- Bronze `#6F4F07` comme couleur de texte et de bouton en clair (or du logo assombri pour atteindre 4,5:1) ; or du logo conservé comme décor et accent en sombre.
- Prix FICTIFS calculés par catégorie (de 5 500 à 39 000 FCFA selon le soin) : uniquement pour que la démonstration soit lisible.
- Horaires de l'ancien site repris et signalés « à confirmer par site ».
- Aucun réseau social ni e-mail réel.

## 4. Résultats de tests (cette app, fin de run)

| Contrôle | Résultat |
|---|---|
| Typecheck, lint | 0 erreur |
| Vitest | **61 / 61** (dont `seed.test.ts` sur le seed Mahaza : références valides, aucun chevauchement, cinq statuts, historique par client) |
| Playwright (375 et 1280 px), sur le build **et sur l'image Docker** (`APP_ENV=staging`) | **27 passés**, 1 ignoré (mobile seul) |
| axe | 0 violation sérieuse ou critique (accueil, 6 écrans du back-office, clair et sombre) |
| `check-design --strict` | 0 violation |
| Anti-fuite | 0 occurrence |
| CI GitHub Actions | verte sur `main` (`verify`, `e2e`, `docker`) |
| Image Docker | build OK, 326 Mo ; `/api/health` 200 ; bandeau « données fictives » présent ; aucun lien `wa.me/<numéro>` ; utilisateur `node` (uid 1000) ; optimiseur d'images opérationnel |
| Mémoire du conteneur | **77 Mo au repos, 146 Mo** après la suite e2e complète (limite proposée : 512 Mo) |

## 5. Mesures (First Load JS, kB gzip)

`/` 146,9 (budget 149) · `/reserver` 172,0 (budget 176 : le seed de 54 soins sur 5 sites ajoute 1,8 kB) · `/admin` 189,9 · `/admin/planning` 188,8.

## 6. Revues avant push

Simplification et revue : aucun code applicatif écrit dans cette app (données et styles seulement). Sécurité (run non sensible) : aucun secret ; liens externes absents ; `.invalid` pour l'adresse de contact. Scan de secrets : recherche manuelle de motifs dans les fichiers suivis : rien (gitleaks arrive en CI au RUN-A).

## 7. Risques ouverts

1. Droits et consentements des photos (§2).
2. Vérification visuelle humaine des 4 combinaisons (375 et 1280 px × clair et sombre) avant la présentation : captures prises et relues par l'agent, pas par Yass.
3. Planning : la vue « Jour » n’affiche que les réservations du jour choisi (le seed les répartit sur la semaine) : montrer la vue « Semaine » pour voir l’agenda rempli.
4. Store transitoire (état dans l'onglet du navigateur) : voir la souche.
5. Staging en HTTP sur IP : risque accepté (`docs/SECURITY.md`).

## 8. Prochain run : RUN-A (souche), puis `git merge upstream/main` dans cette app.
