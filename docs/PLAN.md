# PLAN — Refonte premium 1

**Souche OVAGLOW → `mahaza-app` (institut) et `stlouis-app` (barbershop)**

> Version 1.2 du 2026-10-09 (plan allégé, ADR-043 : RUN-P, A, B, C), décisions validées par Yass.
> Cadrage d'origine : `nothineazi/mahaza-demo` → `docs/refonte-1-cadrage.md` (v1.1). **En cas d'écart, ce plan prime.**

---

## 0. Contexte

- **Contrat signé avec acompte.** Les deux apps sont livrées **en même temps** ; le solde est payé à la livraison. Licence au départ, cession du code spécifique à chaque institut à terme.
- **Objectif** : passer de la démo front-only (Next.js, tout en mémoire) à un **logiciel de gestion** premium, sécurisé, installable (PWA) et déployable par Dokploy. Il doit aussi convaincre les autres instituts du réseau.
- **Données réelles non fournies** : seeds FICTIFS partout. Exception côté Mahaza : les noms des 5 sites et des soins de l'ancien site sont réels.
- **Contraintes Cameroun** :
  - mobile-first, Android **et** iOS ;
  - data chère, coupures de courant ;
  - Mobile Money (acompte manuel, l'app n'encaisse rien) ;
  - WhatsApp comme canal principal ;
  - loi n° 2024/017 sur les données personnelles.

---

## 1. Décisions

| Décision | Raison | Alternative écartée |
|---|---|---|
| Vrai produit avec backend ; données FICTIVES en staging | Un seul code, crédible pour le client et le réseau | Démo simulée jetable |
| **Next.js 16** (migration au RUN-01) | Next 15 sort de la maintenance le 21/10/2026 ; GO Yass | Rester en 15 |
| **Node 24 LTS**, **Tailwind 4**, design system de la factory, polices auto-hébergées (RUN-01b) | Poser les fondations visuelles et l'outillage avant les écrans d'authentification et d'administration ; GO Yass | Faire l'inverse (tout refaire) ; Node 22 ; Tailwind 3 |
| **3 dépôts** : souche privée + 2 apps clientes ; `mahaza-demo` figé puis archivé | Cession par institut, spécificités par client, souche réutilisable pour le réseau | Monorepo ; deux copies sans souche |
| Souche **sans historique** de `mahaza-demo` (import propre) | Aucun média ni contenu Mahaza dans la souche | Fork avec historique |
| Souche **jamais déployée** (CI seule) | Économie du KVM | Instance de démo OVAGLOW |
| **PostgreSQL auto-hébergé, une base par app** | Isolation, portabilité vers le VPS client, données santé | Supabase Free (pause après 7 j d'inactivité, pas de sauvegarde, mélange avec Koverit/IziiCorp) ; Neon |
| **Drizzle** | Proche du SQL, migrations relisibles, `EXCLUDE`/RLS en SQL | Prisma |
| **Better Auth** (authentification) + autorisation maison | Auth.js maintenu en correctifs seulement ; RBAC indépendant de la lib | Auth.js ; plugin organisation |
| Rôles et permissions en code, affectations par site en base | Testable de façon exhaustive | Rôles éditables |
| **RLS** + couche d'accès unique + tests IDOR | Défense en profondeur | Contrôle applicatif seul |
| **pg-boss + worker** | Expirations, notifications, push ; pas de Redis | pg_cron ; Redis |
| **SSE** avec repli polling | Agenda et notifications multi-écrans | Polling seul |
| **WhatsApp N1** : registre, routage, agents, modèles, journal. N3 (Cloud API) en pilote plus tard | Zéro coût ni approbation Meta | Cloud API d'emblée |
| **Acompte manuel** validé par ID de transaction unique | L'app n'encaisse rien ; les captures se falsifient | Agrégateur maintenant |
| Pas d'e-mail en v1 ; invitations par lien partagé sur WhatsApp | Pas de domaine e-mail avant la livraison | E-mail transactionnel |
| **PWA native** factory (manifest + `sw.js` maison) | Standard factory, sans dépendance | Serwist / next-pwa |
| Staging en **`http://IP:PORT`** sur le KVM | Choix de Yass | Domaine dès maintenant |
| Images construites en CI (GHCR), aucun build sur le KVM | KVM partagé avec Koverit et IziiCorp | Build Dokploy sur le serveur |

> **Plan allégé (v1.2, ADR-043)** : parmi ces décisions, RLS, pg-boss, SSE et PWA / Web Push sont **reportés en maintenance** (voir §5). Le contrôle d'accès côté serveur à chaque accès reste obligatoire ; l'expiration des acomptes est calculée paresseusement.

---

## 2. Dépôts et flux de code

```
github.com/nothineazi/
├── ovatech-spa-core   souche OVAGLOW · privé · CI seulement, jamais déployé
├── mahaza-app         créé depuis un tag de la souche · staging sur le KVM
├── stlouis-app        créé depuis un tag de la souche · staging sur le KVM
└── mahaza-demo        figé, toujours en ligne · archivé à la livraison
```

- **Création des apps (ADR-045)** : depuis le tag `demo-v0.1`, **avec l'historique de la souche** (sans ancêtre commun, `git merge upstream/main` serait impossible) ; l'historique est ré-écrit à la cession.
- **Circulation unique** : une évolution du socle se fait dans la souche → tag `core-vX.Y` → `git merge upstream/main` dans chaque app.
- **Les apps ne modifient jamais `src/core/`.** Contrôle : `git diff upstream/main -- src/core` est vide dans chaque app.
- **Ce qui est propre à une app** : `src/brand/`, `brand.config.ts`, médias, seeds.
- **À la cession** : on remet un dépôt à historique propre.

---

## 3. Rôles et accès

| Capacité | super_admin | gerante | reception | praticien | comptable | support_tech |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Portée | tous sites | ses sites | son site | soi-même | tous (lecture) | technique |
| Agenda : voir | tous | ses sites | son site | le sien | – | – |
| Créer / déplacer un RDV | ✅ | ✅ | ✅ | ❌ | – | – |
| Changer un statut | ✅ | ✅ | ✅ | ses RDV | – | – |
| Fiches clients | ✅ | ✅ | ✅ | ses clientes | – | – |
| Contre-indications | ✅ | ✅ | drapeau seul | ses clientes | ❌ | ❌ |
| Catalogue et prix | ✅ | proposer | ❌ | ❌ | ❌ | ❌ |
| Validation d'acompte | ✅ | ✅ | ✅ | ❌ | lecture | ❌ |
| Chiffres | ✅ | son site | ❌ | ❌ | ✅ | ❌ |
| Équipe et horaires | ✅ | son site | ❌ | ses horaires | – | – |
| Lignes WhatsApp et modèles | ✅ | son site | utilise | ❌ | ❌ | ❌ |
| Utilisateurs, rôles, journal d'audit | ✅ | invite son équipe | ❌ | ❌ | ❌ | santé système, logs |

**Super admins** (comptes réels créés uniquement dans les apps, au staging) :
- `mahaza-app` : Linda (fondatrice), Raoul (DRH), Yass (monitoring) ;
- `stlouis-app` : Raoul, Yass.

`support_tech` existe dans le code mais n'est pas utilisé au départ. La souche n'a que des utilisateurs FICTIFS.

---

## 4. Environnements

| Env | Où | Données | Accès |
|---|---|---|---|
| Local | poste de Yass (Windows / PowerShell) ; sandbox de l'agent | seed FICTIF | `localhost` |
| CI | GitHub Actions + service Postgres | seed de test | – |
| Staging | KVM 2 Hostinger (2 vCPU / 8 Go / 100 Go) **partagé avec Koverit et IziiCorp**, Dokploy | FICTIF | `http://IP:PORT` |
| Prod | petit VPS client + Dokploy (payé par le client à la livraison) | réelles | domaine du client, HTTPS |

- **KVM partagé** :
  - limites mémoire et CPU sur chaque conteneur, fixées à partir des mesures (RUN-04) ;
  - aucun build sur le serveur ;
  - Postgres jamais publié sur un port de l'hôte (Docker contourne le pare-feu de l'hôte pour les ports publiés).
- ⚠️ **HTTP sur IP** :
  - cookies `Secure`, service worker, installation PWA et Web Push exigent HTTPS ;
  - le staging fonctionne sans, sauf la PWA et le push ;
  - **le RUN-13 exige un nom d'hôte en HTTPS** : domaine client, ou nom de type `sslip.io` pointant vers l'IP (❓ limites à vérifier).
- **Sauvegardes** :
  - staging : sauvegardes locales Dokploy (le seed est rejouable) ;
  - prod : sauvegardes **hors serveur obligatoires**, plus un test de restauration avant la bascule.

---

## 5. Runs et lots (plan allégé — ADR-043)

Un run se termine par une PR, un rapport `docs/runs/RUN-NN.md` (ou `RUN-X.md`) et une checklist pour Yass. Taille relative : S / M / L / XL.

### Déjà livré

- **RUN-01** — souche OVAGLOW sur Next 16 (PR mergée) ; **RUN-01b** — Node 24, Tailwind 4, couche design factory, polices auto-hébergées, écrans du back-office, allègement (PR mergée). Rapports : `docs/runs/RUN-01.md`, `RUN-01b.md`.

### RUN-P — Apps de démonstration et staging (ce soir) (L)

**Objectif** : deux apps de démonstration propres, aux marques des clients, déployables en staging, pour la présentation.

**Périmètre**
1. **Souche** (`run/p-prep`) : ADR 036 à 040 acceptés ; état de la démo persisté dans `sessionStorage` + « Réinitialiser la démo » (ADR-041) ; couche vocabulaire et personnalisation par la marque (ADR-042) ; tests du socle indépendants de la marque (ADR-044) ; ce plan allégé ; tag `demo-v0.1`.
2. **`mahaza-app` et `stlouis-app`** créés depuis `demo-v0.1` **avec historique** (remote `upstream`), seuls `src/brand/`, `public/brand/`, `brand.config.ts`, le seed, les métadonnées et le contrôle anti-fuite sont modifiés ; `src/core` intact.
3. **Marque Mahaza** : identité premium reprise de `mahaza-demo`, jetons OKLCH, contrastes par script ; données réelles = noms des 5 sites et des soins ; tout le reste FICTIF.
4. **Marque St Louis** : bleu nuit, rouge, crème, motif poteau de barbier ; police d'affichage libre et auto-hébergée ; catalogue et barbiers FICTIFS ; vocabulaire barbershop.
5. **Livraison** : `ci.yml` (identique à la souche) et `release.yml` (image sur `ghcr.io/nothineazi/<dépôt>`), image testée en `APP_ENV=staging`, `docs/RUNBOOK.md` (Dokploy pas à pas).

**Acceptation** : CI verte dans les trois dépôts ; `/api/health` 200 ; bandeau « données fictives » ; liens WhatsApp sans destinataire ; anti-fuite propre ; `git diff upstream/main -- src/core` vide dans chaque app.

### RUN-A — Base de données, authentification, autorisation (L)

- **PostgreSQL + Drizzle** : `docker-compose.dev.yml`, rôles DB `owner` / `app`, extensions (`btree_gist`), migrations versionnées rejouables, `db:migrate`, `db:seed` (FICTIF, idempotent), `db:reset` (dev).
- **Better Auth** : nom d'utilisateur + mot de passe (≥ 12 caractères, liste de mots de passe courants refusés) ; **TOTP obligatoire pour `super_admin`** avec codes de secours ; **invitations** (jeton haché, usage unique, durée limitée, lien transmis par WhatsApp) ; sessions (liste, révocation, désactivation d'un compte) ; `npm run admin:bootstrap` ; limitation de débit sur connexion, activation et 2FA ; aucune inscription publique.
- **Rôles** : `super_admin`, `gerante`, `reception`, `praticien`, avec **portée par site** ; permissions en code ; contrôle serveur systématique (`withPermission`, `Ctx`) à chaque Server Action, route et chargement de données ; refus par défaut.
- **Audit minimal** : connexion et échec, invitation, changement de rôle, export, annulation, validation d'acompte, réinitialisation du 2FA.
- **CI** : tests d'intégration sur un vrai Postgres (service GitHub Actions), **gitleaks**, contrôles d'import DB et de `"use server"` non enveloppés.
- **Acceptation** : migrations rejouables depuis zéro ; une session révoquée tombe à la requête suivante ; matrice rôle × action × site : refus hors portée ; revue de sécurité dédiée (run sensible).

### RUN-B — Référentiel, catalogue, agenda serveur, réservation publique (XL)

- **Sites, salles, équipe, catalogue en base**, avec écrans d'administration (horaires, fermetures, compétences, absences ; catégories, services, durée indicative, prix optionnel, tampon, publication).
- **Agenda serveur** : disponibilité = horaires du site ∩ horaires de la praticienne − absences − blocages − RDV actifs ; contraintes `EXCLUDE` (praticien et salle) garanties par la base ; « Déplacer » par dialogue (pas de glisser-déposer) ; 20 réservations concurrentes sur un créneau → 1 seule réussit.
- **Réservation publique persistante** : idempotence (clé unique), consentements, honeypot, limitation de débit ; **hold `pending_deposit` avec expiration paresseuse** (calculée dans la transaction, sans worker) ; confirmation avec référence, numéro MoMo du site (« FICTIF – ne pas payer »), `.ics`, lien WhatsApp.
- **Acompte manuel** : validé par un **ID de transaction unique** par opérateur et le montant, contrôlés sur le compte du site ; auteur et audit.
- **Lien « Gérer mon RDV »** : jeton de 32 octets aléatoires stocké en SHA-256, valable pour une réservation, expirant, révocable ; voir, annuler, demander un déplacement selon la politique du site ; pages `noindex`. Le jeton d'une autre réservation renvoie 404.
- **Acceptation** : un rechargement ne perd rien ; une double soumission ne crée qu'un RDV ; un hold expiré libère le créneau ; un ID de transaction réutilisé est refusé. Run sensible (acompte, lien client) : revue de sécurité dédiée.

### RUN-C — Exploitation et suivi client (L)

- **Back-office des réservations** : recherche et filtres, cycle de vie avec motifs, historique des changements, notes internes, export CSV audité ; **saisie express** pour la réception (< 30 s, chronométrée par Yass).
- **Fiches clients** : historique, préférences, consentements horodatés ; **contre-indications chiffrées** (AES-256-GCM, `ENCRYPTION_KEY`, lecture journalisée, drapeau seul pour la réception) ; export d'une fiche, anonymisation ; doublons (E.164). Run sensible (données de santé) : revue de sécurité dédiée.
- **WhatsApp N1** : registre des lignes par site et horaires, modèles à variables, boutons depuis un RDV (confirmation, rappel J-1, relance d'acompte), journal « ouvert par X à T » ; liens sans destinataire en staging.
- **Notifications in-app par polling** (centre de notifications, non-lus, par rôle et par site).
- **Sauvegarde / restauration** (`pg_dump` / `pg_restore`, test de restauration en CI), **en-têtes de sécurité** (CSP à nonce, `frame-ancestors 'none'`, HSTS en HTTPS seulement), **`RUNBOOK.md`** complet (déploiement avec base, variables, sauvegarde, retour arrière), mesure de l'empreinte mémoire.

**Après chaque run A, B ou C** : `git merge upstream/main` dans `mahaza-app` et `stlouis-app`, CI verte, redéploiement du staging. Les super admins réels (§3) sont créés dans les apps, jamais dans la souche.

### Reporté en maintenance

RLS (le contrôle serveur systématique reste la barrière) · pg-boss et worker (l'expiration est paresseuse) · SSE (polling) · PWA et Web Push · rôles `comptable` et `support_tech` · caisse et encaissements · fidélité réelle, forfaits, abonnements, cartes cadeaux réelles · stock · RH · rapports et marketing · WhatsApp Cloud API · file d'attente walk-in (`walkInQueue`) · acompte selon la fiabilité (`depositByReliability`) · réservation groupée (`groupBooking`) · mise en service (VPS client, domaine HTTPS, sauvegardes hors serveur, pack conformité juridique).

---

## 6. Questions pour le client (non bloquantes : seeds FICTIFS en attendant)

1. **Sites** : adresses, horaires, fermetures, salles.
2. **Équipe** : membres par site, soins maîtrisés, horaires. Téléphone pro ou perso ? Appareils partagés ?
3. **Catalogue** : durées réelles. Prix affichés publiquement ou non ? Packs existants ?
4. **Acompte** : montant (fixe ou %), numéro MoMo / OM par site, délai d'expiration, qui valide, politique d'annulation / remboursement / no-show.
5. **Réception** : combien de personnes, sur quels sites ?
6. **Accès** : qui voit les contre-indications ? Une praticienne peut-elle déplacer ses propres RDV ?
7. **WhatsApp** : numéros par agence, qui les tient, WhatsApp Business déjà utilisé, horaires de réponse.
8. **Personnel sur iPhone** (push iOS) ; volume de réservations par jour et par site.
9. **Juridique** : validation par un juriste de la loi 2024/017 (APDP, hébergement hors Cameroun) ; reçus et TVA.
10. **Ancien site** : export des clients et historique, avec quel consentement ?
11. **Médias** : photos réelles et droits associés.
12. **St Louis** : part de walk-in, barbiers salariés ou en location de chaise, coupes enfants.
13. **Gérante et réception** : valider la matrice « statut → action primaire » de la fiche de réservation (ADR-039, acceptée provisoirement) : quelle action est la plus fréquente à chaque statut ?

---

## 7. Hors périmètre v1

Glisser-déposer dans le planning · comptes clients · anglais · encaissement en ligne · e-mail · WhatsApp Cloud API (phase 3, pilote) · réalité augmentée / 3D / IA (après livraison).
