# RUN-P — Apps de démonstration et staging (souche)

Branches : `run/p-prep` (PR #3, mergée dans `main` le 2026-10-09, `ceb8b71`) et `run/p-rapport` (ce rapport) · exception validée par Yass pour ce run : l'agent merge ses PR dès la CI verte. Documents liés : `docs/DECISIONS.md` (ADR-036 à 045), `docs/PLAN.md` §5 (plan allégé). Rapports des apps : `mahaza-app` et `stlouis-app`, `docs/runs/RUN-P.md`.

## 1. Fait / non fait

| Élément | Résultat |
|---|---|
| ADR 036, 037, 038, 040 → ACCEPTÉ ; ADR 039 → ACCEPTÉ provisoirement | Fait ; question 13 ajoutée à `PLAN.md` §6 (valider la matrice d'actions avec la gérante et la réception). |
| État de la démo persisté (`sessionStorage`) | Fait (ADR-041) : instantané lié au jour, à la version et à la marque ; repli en mémoire ; jamais d'exception. Une réservation faite sur `/reserver` reste visible dans `/admin`, via l'accueil et après rechargement (e2e à 375 et 1280 px). |
| Bouton « Réinitialiser la démo » | Fait : barre latérale et tiroir mobile du back-office, avec confirmation. |
| Plan allégé (`PLAN.md` §5) | Fait (ADR-043) : RUN-P, RUN-A, RUN-B, RUN-C, section « Reporté en maintenance » ; règle « `git merge upstream/main` dans les deux apps après chaque run A/B/C ». |
| Souche prête à être dérivée par une app qui ne touche que `src/brand/` | Fait (ADR-042, 044) : couche vocabulaire (`vocab.ts`), logo image ou pastille, mention de pied de page, pictogrammes des vedettes, noms interdits par dépôt (`forbidden-names.json`), tests du socle indépendants de la marque, e2e pilotés par la marque. |
| Tag `demo-v0.1` sur `main` | **Non fait par l'agent** : le proxy de la session refuse (403) tout push de tag et toute écriture sur l'API des références. Les apps ont été créées depuis le commit exact `ceb8b71` (merge de la PR #3). Commande à lancer par Yass : voir §7. |

## 2. Écarts au plan

1. **Vocabulaire hors de `src/brand/`** : le socle écrivait « soin » et « praticien » en dur dans 21 fichiers de `src/ui` et `src/core`. Les apps ne pouvant modifier que `src/brand/`, il a fallu (ADR-042) les lire dans `vocab.ts`. Écart de périmètre de la souche, nécessaire à la consigne « ne pas toucher `src/core` ».
2. **Tests et e2e rendus indépendants de la marque** (ADR-044) : sinon la CI « identique à la souche » aurait échoué dans les apps.
3. **Budget `/reserver` relevé de 172 à 176 kB** : le seed d'une marque est embarqué dans le tunnel (56 soins sur 5 sites : +1,8 kB). Le premier essai (`next/image` dans le logo) coûtait +5,6 kB : remplacé par un `<img>` simple, mesuré.
4. **Apps créées avec l'historique de la souche** (ADR-045) : l'historique propre prévu en ADR-003 empêche tout `git merge upstream/main` ; il sera ré-écrit à la cession.
5. **Les dépôts d'app n'étaient pas vides** : chacun contenait un « Initial commit » (README). Il est rattaché par un merge `-s ours` (arbre de la souche conservé, aucun push forcé).

## 3. Décisions À VALIDER

ADR-041 (sessionStorage), 042 (couche de personnalisation), 044 (tests indépendants de la marque), 045 (apps avec historique, publication GHCR).

## 4. Résultats de tests (souche, fin de run)

| Contrôle | Résultat |
|---|---|
| Typecheck, lint | 0 erreur |
| Vitest | **61 / 61** (55 + 6 de persistance) |
| Playwright (375 et 1280 px) | **27 passés**, 1 ignoré (récapitulatif mobile, bureau exclu) ; dont le nouveau scénario « réservation → accueil → admin → rechargement → réinitialisation » |
| axe | 0 violation sérieuse ou critique (accueil, 6 écrans du back-office, clair et sombre) |
| Contrastes AA | 79 couples par thème, 0 échec |
| `check-design --strict` | 38 fichiers, 0 violation |
| Anti-fuite | 0 occurrence (175 fichiers) |
| CI de la PR #3 | verte : `verify`, `e2e`, `docker` |

## 5. Mesures (First Load JS, kB gzip)

| Route | RUN-01b | Fin de RUN-P (souche) | Budget |
|---|---:|---:|---:|
| `/` | 146,9 | 146,9 | 149 |
| `/reserver` | 170,2 | 170,9 | 176 (était 172) |
| `/admin` | 187,6 | 188,8 | – |

## 6. Revues avant push

- **Simplification** : `makeVocab` dérive les pluriels et capitales ; `seedState()` partagé entre le démarrage et la réinitialisation ; test helpers regroupés.
- **Revue** : l'état persisté est validé par forme (version, jour, tableaux) avant usage ; une valeur absente, périmée ou corrompue est ignorée ; l'écriture ne précède jamais l'hydratation (sinon le seed écraserait l'instantané).
- **Sécurité** (run non sensible : ni auth, ni autorisation, ni acompte réel, ni lien client, ni donnée de santé) : aucune donnée ne quitte le navigateur ; `sessionStorage` est propre à l'onglet ; aucun `dangerouslySetInnerHTML`, `eval` ni import dynamique d'entrée utilisateur ajouté ; aucun secret (recherche de motifs dans le diff : rien) ; images `<img>` à source constante issue de la configuration.
- **Scan de secrets** : gitleaks absent de la sandbox ; recherche manuelle de motifs dans le diff et les fichiers suivis : rien. (À brancher en CI au RUN-A, voir plan.)

## 7. Risques ouverts

1. **Tag `demo-v0.1` à poser par Yass** (PowerShell) :
   ```powershell
   git clone https://github.com/nothineazi/ovatech-spa-core.git ; cd ovatech-spa-core
   git tag -a demo-v0.1 ceb8b71 -m "demo-v0.1 : souche prête pour les apps de démonstration"
   git push origin demo-v0.1
   ```
2. **Fond du site public** (ADR-036, accepté) à revoir en vrai sur chaque marque ; **bordure des cartes en sombre** décorative (1,70:1).
3. **Store transitoire** : persisté dans l'onglet seulement ; une réservation faite sur un autre appareil n'apparaît pas (disparaît avec le RUN-A / RUN-B).
4. **`next-themes`** injecte un `<script>` en ligne : la CSP du RUN-C devra le couvrir (nonce).
5. **Image Docker** : 326 Mo (écart avec 235 Mo au RUN-01 toujours non expliqué).

## 8. Prochain run : RUN-A — base de données, authentification, autorisation

À préparer par Yass au démarrage du run seulement : Docker Desktop (PostgreSQL local), puis `BETTER_AUTH_SECRET` et les identifiants des premiers super admins (guide PowerShell donné à ce moment). Voir `PLAN.md` §5.
