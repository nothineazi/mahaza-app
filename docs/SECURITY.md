# SECURITY — ovatech-spa-core

État au **RUN-01**. Référentiel cible : OWASP ASVS 5.0 niveau 2 (grille à produire ; numérotation à vérifier sur la version officielle ⚠️).

## 1. État initial

**Il n'y a pas encore de backend.** Conséquences :

| Sujet | État |
|---|---|
| Données | Aucune donnée réelle. Tout est FICTIF et en mémoire dans le navigateur ; rien n'est envoyé ni stocké. |
| Secrets | Aucun secret dans le dépôt, l'image ou les logs. Aucune variable secrète requise. `.env*` ignoré (sauf `.env.example`). |
| Authentification / autorisation | **Aucune.** `/admin` est ouvert à quiconque atteint l'application. Acceptable parce que la souche n'est jamais déployée ; **bloquant pour tout déploiement** avant les RUN-02 et RUN-03. |
| En-têtes HTTP (CSP, HSTS, `frame-ancestors`…) | Non configurés (RUN-04). |
| Limitation de débit, CSRF, validation Zod | Sans objet (aucune entrée serveur). |
| Journalisation | Aucune donnée personnelle journalisée ; pas de journal d'audit. |
| Conteneur | Utilisateur non-root, `HEALTHCHECK`, fonctionne en lecture seule ; scan Trivy au RUN-03. |
| Indexation | `noindex` (meta `robots` + `public/robots.txt`). |
| Liens WhatsApp | Hors production, sans destinataire : un numéro fictif ne reçoit jamais de message (ADR-025). |
| Numéros d'acompte | FICTIFS, affichés avec « FICTIF – ne pas payer ». L'application n'encaisse rien. |

## 2. Triage de `npm audit` (2026-10-08, après migration Next 16)

Commande : `npm audit` (jamais `npm audit fix --force`). **10 alertes (3 modérées, 7 élevées)**, toutes **transitives dans la chaîne de build Tailwind CSS 3** ou ESLint ; aucune n'est embarquée dans le code exécuté en production.

| Paquet | Gravité | Origine | Exploitable ici ? | Décision |
|---|---|---|---|---|
| `braces` (GHSA-vfj7-8cjw-p6xm, saturation de pile sur motifs très imbriqués) | élevée | `micromatch` ← `fast-glob` / `chokidar` ← `tailwindcss`, `@next/eslint-plugin-next` | Non : les motifs viennent de nos propres fichiers de configuration, pas d'une entrée utilisateur ; outil de build seulement | Accepté ; disparaît avec Tailwind 4 (montée majeure, GO requis) |
| `chokidar`, `micromatch`, `fast-glob` | élevée | idem | Non (idem) | Accepté |
| `tailwindcss` 3.4.19, `tailwindcss-animate` | élevée / modérée | portent les paquets ci-dessus | Non (génération de CSS au build) | Accepté ; Tailwind 4 : ADR à ouvrir |
| `postcss-selector-parser`, `postcss-nested` (GHSA-rj75-hqrm-r3gf, complexité quadratique) | modérée | plugin Tailwind 3 | Non : sélecteurs écrits par nous, au build | Accepté ; pas de correctif disponible |
| `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` | élevée | outil de lint | Non (développement) | Accepté |

**Évolution depuis la base `mahaza-demo`** (12 alertes : 4 modérées, 8 élevées) : l'alerte « PostCSS XSS / lecture de fichier via `sourceMappingURL` » portée par la copie de PostCSS embarquée dans Next est **corrigée** par Next 16.4.0 (`npm audit` proposait justement `next@16.4.0`). Aucune action forcée n'a été appliquée.

**Suivi** : refaire ce triage à chaque run qui touche aux dépendances ; Dependabot (mineures et correctifs) au RUN-03. Le correctif durable est la montée de Tailwind CSS 3 → 4, qui exige une ADR et un GO de Yass.

## 3. Risques connus et acceptés

1. **`/admin` sans authentification** — la souche n'est pas déployée ; levé par les RUN-02 et RUN-03.
2. **Pas d'en-têtes de sécurité** — RUN-04.
3. **`next/font/google` au build** — le build contacte Google Fonts (les fichiers de police sont ensuite servis par l'application). À réévaluer pour un build hors-ligne.
4. **`sw.js` et PWA absents** — RUN-13, HTTPS requis.
5. **Dépassement du budget de poids** — voir ADR-024 (performance, pas sécurité, mais pèse sur les réseaux lents).
6. **Cartes cadeaux simulées** — code fictif, non valable ; aucune valeur n'est créée (ADR-032).

## 4. Revue de sécurité du RUN-01

Le RUN-01 n'introduit ni authentification, ni autorisation, ni acompte réel, ni lien client, ni donnée de santé : ce n'est pas un run « sensible » au sens de `CLAUDE.md` §3. Une relecture ciblée a tout de même été faite (voir `docs/runs/RUN-01.md`) : secrets, `APP_ENV` (valeur par défaut sûre), liens `wa.me`, injection CSV (neutralisation des formules, déjà testée), génération de l'`.ics`, absence de `dangerouslySetInnerHTML`.
