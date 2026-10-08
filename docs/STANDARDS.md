# STANDARDS — ovatech-spa-core

> Autoportant. S'applique à la souche et aux dépôts clients qui en dérivent (`mahaza-app`, `stlouis-app`).
> Toute dérogation passe par une ADR dans `docs/DECISIONS.md` validée par Yass.

---

## 1. Stack

| Couche | Choix | Notes |
|---|---|---|
| Runtime | **Node.js 24 LTS** (« Krypton », support jusqu'au 2028-04-30) | Version figée dans `.nvmrc`, `engines` et le Dockerfile (ADR-019) |
| Framework | **Next.js 16** (App Router), React 19.x, TypeScript `strict` | Lire `node_modules/next/dist/docs/` avant d'écrire du code Next : conventions différentes de Next 15 (ex. `proxy` à la place de `middleware` ⚠️ à vérifier dans la doc embarquée) |
| UI | **Tailwind CSS 4** (configuration CSS-first, `@theme`), `next-themes` (clair / sombre par classe), composants kv du back-office (`src/ui/kv`) et primitives du site public | Les composants de base (`src/ui/primitives`, shadcn) ne sont jamais modifiés en place : on étend par `className` ou on compose (ADR-035, ADR-036) |
| Polices | **Auto-hébergées** par `next/font/local` : Inter (corps), Cormorant Garamond (affichage), JetBrains Mono (code) | Licences ouvertes seulement (OFL ou équivalent), fichier de licence versionné à côté de chaque police, sous-ensemble latin, graisses limitées à l'usage réel. Aucun service de polices (ADR-038) |
| Base | **PostgreSQL** (majeure stable courante, figée) | Une base **par app**, auto-hébergée ; extensions `btree_gist` (+ `pgcrypto` si utile) |
| ORM | **Drizzle ORM** + drizzle-kit | Migrations SQL versionnées et relues ; SQL brut pour `EXCLUDE`, RLS, `GRANT` |
| Auth | **Better Auth**, uniquement pour l'authentification | Adaptateur Drizzle ; plugins nom d'utilisateur + 2FA TOTP. Autorisation **maison** |
| Tâches | **pg-boss** + process worker (même image, commande dédiée) | Pas de Redis |
| Validation | Zod | Toute entrée serveur |
| Temps réel | SSE, avec repli polling | |
| Tests | Vitest, Playwright, `@axe-core/playwright`, fast-check (moteur d'agenda) | |
| Conteneur | Dockerfile multi-stage, `output: 'standalone'`, utilisateur non-root, `HEALTHCHECK` | |
| CI | GitHub Actions | Images construites en CI, **jamais sur le KVM** |
| Registre | GHCR | Dépôts clients uniquement |
| Déploiement | Dokploy | Staging : KVM partagé, accès `http://IP:PORT`. Prod : VPS client + Dokploy |

**Interdits sans ADR** : Supabase, Neon, Redis, Prisma, Auth.js/NextAuth, next-pwa/Serwist, framer-motion dans l'admin, tout SaaS tiers, tout service de polices (`next/font/google`, Google Fonts, Typekit…). **Pas d'e-mail en v1.**
**Versions** : toute montée majeure = ADR + GO de Yass. Exception actée le 2026-10-08 : Next.js 16 et les dépendances que cette migration exige.

---

## 2. Architecture et structure

```
src/
  app/            routes Next : accueil à la racine ; (app)/ = /reserver et /admin (seules routes qui chargent le store de la démo) ; api/
  core/           SOCLE — jamais modifié dans un dépôt client
    db/           schéma Drizzle, client, transaction avec contexte RLS
    auth/ authz/ audit/
    booking/      moteur de disponibilité, réservations, acompte
    catalog/ clients/ staff/ sites/ whatsapp/ notifications/ jobs/
    lib/          erreurs structurées, logger, rate-limit, crypto, temps
  brand/          MARQUE — seul dossier modifié par un dépôt client
    brand.config.ts   nom, fonctionnalités activées, politiques par défaut
    theme/            tokens CSS clair/sombre
    assets/ copy/ seed/
  ui/             composants partagés : primitives et pages du site public, kv/ (design system du back-office), admin/
drizzle/          migrations SQL
scripts/          seed, bootstrap admin, sauvegarde/restauration, contrôles
docs/
```

- **Monolithe modulaire** : un process web + un process worker.
- Les routes, pages et Server Actions **n'accèdent jamais à la base directement** : elles appellent les services de `src/core/**`, qui exigent un `Ctx` (utilisateur, permissions, portée).
- Contrôle CI : importer le client DB hors de `src/core` est interdit ; tout export `"use server"` doit passer par le wrapper de permission.
- Personnalisation client = `src/brand/` + `brand.config.ts` (fonctionnalités : `walkInQueue`, `groupBooking`, `depositByReliability`…). Si une personnalisation exige de toucher `src/core`, c'est une évolution du socle : elle se fait dans la souche, puis est mergée dans les apps.

---

## 3. Données

- **Temps** : stocké en UTC (`timestamptz`), affiché en `Africa/Douala` (UTC+1, sans heure d'été).
- **Montants** : FCFA en entiers, jamais en flottant.
- **Téléphones** : normalisés E.164. Le numéro n'est **jamais** une preuve d'identité (SIM multiples, numéros recyclés).
- **Anti double réservation garanti par la base** : `booking_segment` porte `EXCLUDE USING gist (staff_id WITH =, period WITH &&) WHERE (statut actif)`, et la même contrainte sur `room_id`. L'interface ne fait qu'afficher les conflits renvoyés.
- **Idempotence** : toute création publique (réservation) porte une clé d'idempotence unique.
- **Migrations** : forward-only, relues, rejouées depuis une base vide en CI.
- **RLS** (défense en profondeur) sur les tables portées par site. Le contexte est posé par `SET LOCAL` (`app.user_id`, `app.site_ids`, `app.is_global`) dans une transaction par requête. Le rôle DB applicatif n'a pas `BYPASSRLS` et n'est pas propriétaire des tables ; les migrations tournent avec le rôle propriétaire.
- **`audit_log` append-only** : `REVOKE UPDATE, DELETE` au rôle applicatif.
- Suppression d'une personne = **anonymisation** (les statistiques sont conservées).

---

## 4. Authentification et autorisation

- **Personnel uniquement** ; aucun compte client.
- **Comptes sur invitation** : lien à usage unique, expirant, jeton stocké haché, transmis par l'admin via WhatsApp. Aucune inscription publique.
- **Pas d'e-mail en v1** : la réinitialisation du mot de passe se fait par un admin.
- **Identifiant** : nom d'utilisateur attribué par l'admin (⚠️ à valider). Mot de passe ≥ 12 caractères, refusé s'il figure dans une liste de mots de passe courants.
- **TOTP obligatoire** pour `super_admin` et `gerante` (enrôlement forcé à la première connexion), avec codes de secours. Un super admin peut réinitialiser le 2FA d'un autre (action journalisée).
- **Sessions** :
  - cookies `HttpOnly`, `SameSite=Lax` ;
  - `Secure` dès que `APP_URL` est en HTTPS. Le staging en `http://IP` le désactive, ce qui est documenté dans `SECURITY.md` comme un risque accepté de staging ;
  - expiration à l'inactivité et expiration absolue ;
  - liste des sessions, révocation ;
  - désactiver un compte révoque toutes ses sessions.
- **Rate limiting** sur login, activation d'invitation, 2FA.
- **Bootstrap** : le premier super admin est créé par `npm run admin:bootstrap` (CLI + variables d'environnement), **jamais par une route**.
- **Autorisation** :
  - les permissions sont des constantes en code (`booking.read`, `booking.move`, `client.health.read`…) ;
  - la correspondance rôle → permissions est en code ;
  - les affectations utilisateur × rôle × portée (`global` | `site`) sont en base ;
  - la portée « soi-même » (praticienne) est appliquée dans les services.
- **Rôles** : `super_admin`, `support_tech`, `gerante`, `reception`, `praticien`, `comptable`.
- **Refus par défaut**. Contrôle serveur dans chaque Server Action, route et chargement de données via `withPermission`. Le `proxy`/middleware ne sert qu'à la redirection d'interface.

---

## 5. Sécurité (socle)

- **Entrées** : Zod partout. Erreurs API structurées, sans pile ni détail interne.
- **En-têtes** :
  - CSP stricte avec nonce ;
  - `frame-ancestors 'none'` ;
  - `Referrer-Policy: strict-origin-when-cross-origin` ;
  - `Permissions-Policy` minimale ;
  - `X-Content-Type-Options: nosniff` ;
  - HSTS **uniquement en HTTPS**.
- **CSRF** : vérification d'origine des Server Actions + `SameSite`. Les routes POST maison vérifient `Origin`.
- **Rate limiting adossé à Postgres** (résiste aux redémarrages) sur réservation, lien client, login.
- **Formulaires publics** : honeypot, limites par numéro de téléphone et par IP.
- **Lien client « Gérer mon RDV »** : jeton de 32 octets aléatoires, stocké en SHA-256, valable pour une réservation, expirant, révocable ; pages `noindex`.
- **Contre-indications** : chiffrées côté app (AES-256-GCM, clé `ENCRYPTION_KEY`, identifiant de clé pour la rotation). Chaque lecture est journalisée. La réception ne voit qu'un drapeau.
- **CSV** : neutralisation des formules ; export soumis à permission et audité.
- **Logs** : JSON structurés, identifiant de corrélation, **aucune donnée personnelle ni secret**.
- **Secrets** : variables d'environnement seulement ; `.env*` ignorés ; gitleaks en CI et avant push.
- **Dépendances** :
  - `npm ci` ;
  - **jamais `npm audit fix --force`** ;
  - triage documenté dans `SECURITY.md` ;
  - Dependabot limité aux versions mineures et correctifs.
- **Conteneur** : non-root, système de fichiers en lecture seule si possible, `HEALTHCHECK`, scan Trivy en CI.
- **Référentiel** : OWASP ASVS 5.0 niveau 2. La grille est dans `SECURITY.md` ; numérotation à vérifier sur la version officielle ⚠️.

---

## 6. Données personnelles — loi camerounaise n° 2024/017 (❓ validation par un juriste à venir)

- **Consentement** explicite, non pré-coché. Le contact WhatsApp transactionnel est séparé du marketing. On horodate le consentement et on stocke la version du texte accepté.
- **Minimisation** : contre-indications structurées, texte libre court.
- **Droits des personnes** : export d'une fiche, rectification, suppression par anonymisation.
- **Pages** mentions légales et politique de confidentialité, marquées « texte à valider par un juriste ».
- **Mineurs** (barbershop) : contact d'un parent.
- **Aucun texte libre de conversation WhatsApp stocké.**

---

## 7. Contexte Cameroun (contraintes de conception)

- **Mobile-first** : Android d'entrée de gamme **et** iOS Safari.
- **Budget de poids** : le First Load JS des routes publiques respecte `scripts/first-load-budget.json`, contrôlé en CI (ADR-040 : 149 kB pour `/`, 172 kB pour `/reserver`, gzip ; base d'origine Next 15 : 142 / 168 kB). Tout ce qui n'est pas utile au premier écran est chargé à la demande (`next/dynamic`, `IntersectionObserver`) ; le store de la démo ne se charge que dans `(app)/`. Images AVIF/WebP via `next/image`, chargement différé, aucune vidéo en lecture automatique.
- **Réseau instable** :
  - états de chargement explicites ;
  - boutons désactivés pendant l'envoi ;
  - idempotence ;
  - message d'erreur toujours accompagné d'une action ;
  - brouillons conservés côté client.
- **FR uniquement** : textes centralisés par module (`copy.ts`) pour une i18n future, sans bibliothèque d'i18n.
- **Paiement : l'app n'encaisse rien.**
  - Le client envoie l'acompte manuellement au numéro Mobile Money du site.
  - Le personnel le valide avec un **ID de transaction unique** et le montant, contrôlés **sur le compte de l'institut**, jamais sur une capture d'écran.
- **WhatsApp** : liens `wa.me` uniquement (niveau N1).
  - En staging (`APP_ENV=staging`), les liens sont **sans destinataire** : `https://wa.me/?text=…`.
  - En prod, ils pointent vers le numéro de la ligne routée.

---

## 8. Design et interface

**Référence** : `docs/reference/factory-core.md` (design system de la factory) fait foi pour les jetons, l'échelle `kv`, les composants et le garde-fou ; les écarts propres à cette souche sont dans l'ADR-036 (deux registres, `--gold`, `--line`, coque). Le thème sombre est piloté par la **classe `.dark`** sur `<html>` (`next-themes`, `attribute="class"`, défaut = thème du système), jamais par `prefers-color-scheme` seul ; `color-scheme` natif dans les deux thèmes.

**Deux registres** : le back-office suit strictement le système factory (zone `.kv-app`) ; le site public garde son registre premium éditorial, propre à chaque marque, et ne partage que les jetons de couleur.

**Site public** : registre premium éditorial hérité de la démo, propre à chaque marque.

**Back-office** (règles factory) :
- **Hiérarchie et couleur** :
  - un seul élément dominant par écran ;
  - la couleur porte le sens, jamais la décoration ;
  - la profondeur se fait par la bordure, les ombres sont réservées aux surfaces flottantes.
- **Densité et tailles** :
  - corps de texte 13 px sur desktop, 14 px sur mobile (échelle `text-kv-*`, interdit : `text-sm`, `text-xs`, `text-[…px]`) ;
  - contrôles 32 px sur desktop, 44 px sur mobile ;
  - champs en 16 px sur mobile (évite le zoom iOS) ;
  - `tabular-nums` sur les chiffres.
- **Formulaires et actions** : libellé de champ au-dessus ; une action primaire par écran ; l'action destructive va dans un menu.
- **Tableaux** : cartes empilées sous 640 px ; **aucun défilement horizontal de page à 375 px**.
- **États** : vide ; chargement avec squelette aux dimensions exactes ; erreur qui dit ce qui s'est passé et quoi faire.
- **Thème et accessibilité** :
  - clair et sombre ;
  - **WCAG 2.x AA** : texte 4,5:1, éléments d'interface 3:1, contrastes calculés par script pour chaque thème ;
  - focus visible ;
  - `prefers-reduced-motion` respecté.
- **Animations** : CSS uniquement, pas de framer-motion dans l'admin.
- **Planning** : **pas de glisser-déposer**, on passe par le dialogue « Déplacer ».
- **Largeurs de test** : 375, 1280 et 1440 px.

---

## 9. Données FICTIVES

- Toute donnée non fournie par le client est **FICTIVE** : prix, durées, adresses, numéros, personnes, KPI, avis.
- **Marquage obligatoire** :
  - indicateur `is_fictitious` ou convention de seed ;
  - badge « FICTIF » visible à l'écran ;
  - bandeau global « Version de développement – données fictives » tant que `APP_ENV != production`.
- **Numéros fictifs** : affichés avec la mention « FICTIF – ne pas payer ». En staging, les liens WhatsApp n'ont pas de destinataire.
- **Exception** (dans `mahaza-app` uniquement) : les noms des 5 sites et des soins issus de l'ancien site Mahaza sont réels.
- **Jamais** de KPI, d'avis ou de badge « le plus choisi » inventés présentés comme réels.
- **Images** :
  - SVG générés, ou photos libres de droits téléchargées et hébergées (pas de lien direct) ;
  - aucun visage reconnaissable ;
  - page Crédits.

---

## 10. Tests

- **Unitaires** : logique pure (moteur de disponibilité, règles du catalogue, routage WhatsApp, permissions).
- **Intégration sur un vrai Postgres** : contraintes, RLS, permissions, concurrence, idempotence.
- **Matrice d'autorisation générée** : chaque rôle × chaque action × un autre site → refus attendu.
- **E2E Playwright** à 375 et 1280 px : réservation publique, connexion + 2FA, parcours clés du back-office. axe sans violation sérieuse.
- **Concurrence** : 20 réservations parallèles sur le même créneau → **1 seule** réussit.
- **Anti-fuite de marque** : dans la souche, `git grep -i` sur « mahaza » et « st louis » ne renvoie rien (hors `docs/runs/`).

---

## 11. Git, CI, discipline

- Une branche par run `run/NN-slug`, Conventional Commits en FR (scopes `core`, `brand`), une PR par run. **Jamais de push direct sur `main`.**
- **Avant chaque push** : tests verts → simplification → revue → checklist sécurité → scan secrets → push.
- **`package-lock.json`** : après toute installation, vérifier qu'il est modifié et le committer.
- **CI bloquante** :
  - typecheck, lint ;
  - tests unitaires, intégration (service Postgres), e2e smoke ;
  - `check:contrast` (OKLCH, 2 thèmes), `check:design --strict` (back-office), budget de First Load JS ;
  - gitleaks ;
  - build de l'image + Trivy (vulnérabilités critiques corrigeables) ;
  - `npm audit` en rapport, avec liste d'exceptions triées.
- Scripts `npm` multiplateformes. La doc des commandes locales est en **PowerShell**.

---

## 12. Documentation (à jour à chaque lot)

- `README.md` : installer, lancer, tester, commandes PowerShell.
- `docs/ARCHITECTURE.md` : modules, flux, schéma de données.
- `docs/DECISIONS.md` : ADR numérotées (contexte, décision, alternatives, conséquences, statut).
- `docs/SECURITY.md` : modèle de menaces, mesures, triage `npm audit`, grille ASVS, risques acceptés.
- `docs/RUNBOOK.md` (dès L0.6) : déploiement Dokploy, variables, sauvegarde, restauration, incident, retour arrière.
- `CHANGELOG.md`.
- `docs/runs/RUN-NN.md`.

---

## 13. Copy public

- Jamais « Orange Cameroun » / OCM (l'employeur du fondateur), ni dans le copy ni comme référence.
- Orange Money et MTN MoMo peuvent être nommés comme moyens de paiement.
- Ne jamais annoncer une fonctionnalité non construite ni un chiffre inventé.
