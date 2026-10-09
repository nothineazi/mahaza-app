# SECURITY — ovatech-spa-core

État au **RUN-01b**. Référentiel cible : OWASP ASVS 5.0 niveau 2 (grille à produire ; numérotation à vérifier sur la version officielle ⚠️).

## 1. État initial

**Il n'y a pas encore de backend.** Conséquences :

| Sujet | État |
|---|---|
| Données | Aucune donnée réelle. Tout est FICTIF ; l'état de la démo est conservé dans le `sessionStorage` de l'onglet (vidé à sa fermeture, jamais envoyé) ; rien n'est stocké côté serveur (ADR-041). |
| Secrets | Aucun secret dans le dépôt, l'image ou les logs. Aucune variable secrète requise. `.env*` ignoré (sauf `.env.example`). |
| Authentification / autorisation | **Aucune.** `/admin` est ouvert à quiconque atteint l'application. Acceptable parce que la souche n'est jamais déployée ; **bloquant pour tout déploiement** avant les RUN-02 et RUN-03. |
| En-têtes HTTP (CSP, HSTS, `frame-ancestors`…) | Non configurés (RUN-04). |
| Limitation de débit, CSRF, validation Zod | Sans objet (aucune entrée serveur). |
| Journalisation | Aucune donnée personnelle journalisée ; pas de journal d'audit. |
| Conteneur | Utilisateur non-root, `HEALTHCHECK`, fonctionne en lecture seule ; scan Trivy au RUN-03. |
| Indexation | `noindex` (meta `robots` + `public/robots.txt`). |
| Liens WhatsApp | Hors production, sans destinataire : un numéro fictif ne reçoit jamais de message (ADR-025). |
| Numéros d'acompte | FICTIFS, affichés avec « FICTIF – ne pas payer ». L'application n'encaisse rien. |

## 2. Triage de `npm audit`

Commande : `npm audit` (jamais `npm audit fix --force`). Triage refait le **2026-10-08, après la migration Tailwind 4 (RUN-01b)**.

**Résultat : 5 alertes (0 modérée, 5 élevées), toutes une seule chaîne transitive d'outil de lint** ; aucune n'est embarquée dans le code exécuté en production (la chaîne Tailwind 3 et ses 5 autres alertes ont disparu avec la montée de version).

| Paquet | Gravité | Origine | Exploitable ici ? | Décision |
|---|---|---|---|---|
| `braces` (GHSA-vfj7-8cjw-p6xm, saturation de pile sur motifs très imbriqués) | élevée | `micromatch` ← `fast-glob` ← `@next/eslint-plugin-next` ← `eslint-config-next@16.4.0` | Non : les motifs viennent de nos propres fichiers, pas d'une entrée utilisateur ; outil de lint, hors image de production | Accepté. Pas de correctif amont : `npm audit` ne propose que `eslint-config-next@14.2.35` (rétrogradation de deux majeures, refusée) |
| `micromatch`, `fast-glob`, `@next/eslint-plugin-next`, `eslint-config-next` | élevée | idem (propagation de la même alerte) | Non (développement) | Accepté ; surveiller la prochaine mineure de Next |

**Historique** : base `mahaza-demo` 12 alertes (4 modérées, 8 élevées) → RUN-01 (Next 16 corrige l'alerte PostCSS embarquée) 10 → RUN-01b (Tailwind 4, `tailwindcss-animate` retiré, `autoprefixer` retiré) **5**. Aucune action forcée n'a été appliquée.

**Suivi** : refaire ce triage à chaque run qui touche aux dépendances ; Dependabot (mineures et correctifs) au RUN-03.

## 3. Risques connus et acceptés

1. **`/admin` sans authentification** — la souche n'est pas déployée ; levé par les RUN-02 et RUN-03.
2. **Pas d'en-têtes de sécurité** — RUN-04.
3. ~~`next/font/google` au build~~ — **levé au RUN-01b** : polices auto-hébergées (ADR-038), le build ne contacte plus aucun service.
4. **`sw.js` et PWA absents** — RUN-13, HTTPS requis.
5. **Dépassement du budget de poids** — voir ADR-024 (performance, pas sécurité, mais pèse sur les réseaux lents).
6. **Cartes cadeaux simulées** — code fictif, non valable ; aucune valeur n'est créée (ADR-032).

## 4. Revue de sécurité du RUN-01

Le RUN-01 n'introduit ni authentification, ni autorisation, ni acompte réel, ni lien client, ni donnée de santé : ce n'est pas un run « sensible » au sens de `CLAUDE.md` §3. Une relecture ciblée a tout de même été faite (voir `docs/runs/RUN-01.md`) : secrets, `APP_ENV` (valeur par défaut sûre), liens `wa.me`, injection CSV (neutralisation des formules, déjà testée), génération de l'`.ics`, absence de `dangerouslySetInnerHTML`.

## 5. Revue de sécurité du RUN-01b

Run non « sensible » au sens de `CLAUDE.md` §3 (pas d'authentification, d'autorisation, d'acompte réel, de lien client ni de donnée de santé). Revue ciblée faite quand même (voir `docs/runs/RUN-01b.md` §6) :

- **Nouvelle dépendance `next-themes`** : injecte un `<script>` en ligne (anti-clignotement) et lit / écrit la clé `theme` de `localStorage` (valeur `light`, `dark` ou `system`, aucune donnée personnelle). **À couvrir par le nonce de la CSP au RUN-04** (`script-src` avec nonce) ; la souche n'a pas de CSP aujourd'hui.
- **Aucune requête réseau externe au build ni à l'exécution** pour les polices (auto-hébergées) ; test unitaire qui interdit leur retour.
- **Pas de `dangerouslySetInnerHTML`, `innerHTML`, `eval`** ajoutés ; liens externes en `rel="noopener noreferrer"` (WhatsApp) ; l'import dynamique ne reçoit aucune donnée utilisateur.
- **Menus et fiches du back-office** : actions destructives derrière un menu (et confirmation pour la suppression d'une salle ou d'un praticien) ; contrôle d'accès à ajouter aux RUN-02 / RUN-03 (`/admin` reste ouvert, risque n° 1 ci-dessus).
- **Dépendances** : `tw-animate-css` (MIT, CSS pur) remplace `tailwindcss-animate` ; `next-themes` 0.4.6 (MIT) ; `npm audit` : 5 alertes élevées, toutes la chaîne de lint (voir §2).
