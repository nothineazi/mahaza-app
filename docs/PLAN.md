# PLAN — Refonte premium 1

**Souche OVAGLOW → `mahaza-app` (institut) et `stlouis-app` (barbershop)**

> Version 1.0 du 2026-10-08, décisions validées par Yass.
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

---

## 2. Dépôts et flux de code

```
github.com/nothineazi/
├── ovatech-spa-core   souche OVAGLOW · privé · CI seulement, jamais déployé
├── mahaza-app         créé depuis un tag de la souche · staging sur le KVM
├── stlouis-app        créé depuis un tag de la souche · staging sur le KVM
└── mahaza-demo        figé, toujours en ligne · archivé à la livraison
```

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

## 5. Runs et lots

Un run se termine par une PR, un rapport `docs/runs/RUN-NN.md` et une checklist pour Yass. Taille relative : S / M / L / XL.

### Phase 0 — Socle (dans la souche)

#### RUN-01 — L0.1 Création de la souche + Next 16 (L)

**Objectif** : une souche générique OVAGLOW, propre, sur Next 16, sans contenu ni historique Mahaza.

**Périmètre**
1. Mesurer la **base de référence** sur un clone de `mahaza-demo` : nombre de tests, `next build` (First Load JS par route), liste des routes. Consigner dans le rapport.
2. Faire l'**inventaire** classé : générique à garder / contenu et médias Mahaza à exclure / legacy St Louis à exclure / build et infra à garder.
3. **Importer** l'arbre nettoyé, sans `.git`, `node_modules`, `.next`, `.env*` ni médias Mahaza, en un commit `chore(core): import depuis mahaza-demo@<sha>`.
4. Supprimer le legacy St Louis (`components/booking|admin|ui` legacy, `data/stlouis.ts`, `lib/store.tsx` legacy), `NEXT_PUBLIC_THEME` et les aiguillages `theme.id`.
5. **Rebrander en OVAGLOW** :
   - tokens clair/sombre avec contrastes calculés par script ;
   - wordmark texte ;
   - illustrations SVG ;
   - sites, soins, praticiens et prix **FICTIFS** ;
   - bandeau « Version de développement – données fictives ».
6. **Restructurer** en `src/core`, `src/brand`, `src/ui`, `src/app`, avec `brand.config.ts`.
7. **Migrer vers Next 16** et les dépendances requises : codemod officiel si disponible, doc embarquée, React 19.x en dernière mineure. Une ADR par version figée.
8. Mettre en place une **CI minimale** : typecheck, lint, tests, build.
9. Initialiser la **documentation** : `README`, `ARCHITECTURE`, `DECISIONS` (reprendre le §1 en ADR), `SECURITY`, `CHANGELOG`.

**Acceptation**
- Tous les parcours de la démo fonctionnent sous OVAGLOW :
  - réservation multi-soins jusqu'à la confirmation (.ics, WhatsApp, compte à rebours) ;
  - admin : planning, réservations, clients, salles, équipe, export CSV.
- Les tests existants applicables restent verts.
- First Load JS ≤ base de référence ; CLS ≈ 0.
- L'anti-fuite de marque est vide.
- L'image Docker démarre et `/api/health` répond 200.

**Tests** : suite existante, smoke e2e Playwright à 375 et 1280 px, contrôle anti-fuite.

**Risques** : régressions Next 16 (cache, `params` asynchrones, `proxy`). Parade : étapes séparées, chacune avec ses tests. En cas de blocage dur, documenter et s'arrêter **avant** de livrer une souche en Next 15.

#### RUN-02 — L0.2 Base de données + L0.3 Authentification (L)

**L0.2 — Base**
- Postgres local avec un `docker-compose.dev.yml` fourni à Yass.
- Drizzle, extensions, rôles DB `owner` / `app`.
- Schéma du socle : `organisation`, `site`, `room`, `staff_member`, tables Better Auth, `role_assignment`, `invitation`, `audit_log`, `rate_limit`, `idempotency_key`.
- Scripts `db:migrate`, `db:seed` (FICTIF, idempotent), `db:reset` (dev uniquement).

**L0.3 — Authentification**
- Better Auth avec nom d'utilisateur + TOTP.
- Invitation : jeton haché, usage unique, durée configurable.
- Page d'activation : choix du mot de passe + enrôlement TOTP si le rôle l'exige ; codes de secours.
- Connexion et déconnexion.
- Sessions : liste et révocation ; désactivation d'un compte ; réinitialisation par un admin.
- `npm run admin:bootstrap`.
- Rate limiting.

**Acceptation**
- Les migrations se rejouent depuis zéro.
- Le seed est rejouable.
- Le rôle `app` ne peut pas faire de DDL.
- Aucune inscription publique n'est possible.
- Le TOTP est forcé pour les rôles concernés.
- Une session révoquée tombe à la requête suivante.
- Les attributs des cookies sont corrects en HTTP comme en HTTPS.

**Tests** : intégration ; e2e connexion / 2FA / révocation / force brute.

**Risques** : perte du TOTP d'un super admin. Parade : codes de secours et réinitialisation par un autre super admin, journalisée.

#### RUN-03 — L0.4 Autorisation, RLS, audit + L0.5 CI/CD complète (L)

**L0.4 — Autorisation**
- Permissions et rôles en code, `withPermission`, `Ctx`, services du socle.
- Politiques RLS et transaction avec `SET LOCAL` ; `GRANT` / `REVOKE`.
- Service d'audit sur les actions sensibles : connexion et échec, invitation, changement de rôle, export, lecture de contre-indications, annulation, validation d'acompte, réinitialisation 2FA.
- Contrôles CI : imports DB, `"use server"` non enveloppés.
- Écrans super admin : utilisateurs et rôles, journal d'audit filtrable.

**L0.5 — CI/CD**
- Pipeline complet (`STANDARDS.md` §11) : axe, gitleaks, Trivy, `npm audit`.
- Dependabot (mineures et correctifs uniquement).
- Modèle de PR.
- Recommandation de protection de `main` documentée.

**Acceptation**
- La matrice rôle × action × site est entièrement couverte.
- Une requête SQL avec un mauvais contexte RLS renvoie 0 ligne.
- `audit_log` est non modifiable par le rôle `app`.
- La CI rejette une PR si un faux secret est planté ou si un test échoue.

#### RUN-04 — L0.6 Chaîne de livraison et exploitation, sans déploiement (M)

**Périmètre**
- Dockerfile de prod : standalone, non-root, `HEALTHCHECK`.
- Commande worker : pg-boss initialisé, un job de contrôle.
- `docker-compose.staging.yml` de référence : app, worker, Postgres interne, limites mémoire et CPU.
- En-têtes de sécurité.
- Scripts `backup` / `restore` (`pg_dump` / `pg_restore`) et **test de restauration automatisé en CI**.
- Workflow de release (build + push GHCR) prêt mais **désactivé dans la souche**, activé dans les apps.
- `RUNBOOK.md` complet pour Dokploy : Postgres, app à partir de l'image GHCR, worker, variables, ports, limites, sauvegardes, retour arrière.

**Acceptation**
- Le compose de staging démarre app + worker + base ; health OK.
- La restauration est testée.
- L'**empreinte mémoire réelle** est mesurée et consignée.

**Risques** : KVM partagé. Les limites sont fixées à partir des mesures.

### Phase 1 — Opérations (dans la souche)

#### RUN-05 — L1.1 Référentiel et paramètres + L1.2 Catalogue (L)

**L1.1 — Référentiel**
- Sites : horaires hebdomadaires, fermetures exceptionnelles, numéro d'acompte FICTIF, politiques d'acompte / d'expiration / d'annulation configurables.
- Salles.
- Équipe : sites, compétences (soins réalisés), horaires, absences.

**L1.2 — Catalogue**
- Catégories ; services avec durée « indicative » possible et prix **optionnel**.
- Variantes, options, packs ordonnés à prix forfaitaire.
- **Tampon après soin**.
- Disponibilité par site ; brouillon / publié ; historique des prix ; import / export CSV.

**Acceptation**
- Un pack ne contient aucun service inactif.
- Chaque soin a au moins une praticienne qualifiée.
- Une gérante est limitée à son site.
- Tout est audité.
- Le site public lit le catalogue publié.
- Sans prix : « Tarif communiqué à la réservation ».

#### RUN-06 — L1.3 Moteur de disponibilité et agenda (XL)

**Périmètre**
- Créneaux = horaires du site ∩ horaires de la praticienne − absences − blocages − RDV actifs, tampons inclus.
- Séquence multi-soins : segments praticienne + salle.
- « Sans préférence » : attribution automatique.
- Contraintes `EXCLUDE`.
- Blocages : congé, pause, maintenance de salle.
- Vues jour / semaine par praticienne ou par salle ; « Ma journée » pour la praticienne.
- « Déplacer » par dialogue, avec les conflits renvoyés par la base.
- Rafraîchissement par SSE.

**Acceptation**
- 20 réservations concurrentes sur un même créneau → 1 seule réussit.
- Stockage en UTC, affichage `Africa/Douala`.

**Tests** : tests de propriétés (fast-check) sur le moteur ; concurrence en intégration.

**Risques** : performance sur 14 jours × 5 sites. Parade : calcul par site et par jour, index.

#### RUN-07 — L1.4 Réservation publique et acompte manuel + L1.6 « Gérer mon RDV » (L)

**L1.4 — Réservation publique**
- Parcours branché sur le serveur.
- Hold `pending_deposit` avec `expires_at` : expiration paresseuse dans la transaction + job pg-boss.
- Idempotence ; consentements ; honeypot ; rate limiting.
- Confirmation : référence, numéro MoMo du site (« FICTIF – ne pas payer »), compte à rebours, `.ics`, lien WhatsApp.
- Validation de l'acompte en back-office : ID de transaction unique par opérateur, montant, auteur, audit.
- Pages mentions légales et confidentialité (« à valider par un juriste »).

**L1.6 — « Gérer mon RDV »**
- Lien selon `STANDARDS.md` §5 : voir, annuler, demander un déplacement selon la politique du site.

**Acceptation**
- Un rechargement ne perd rien.
- Une double soumission ne crée qu'un seul RDV.
- Un hold expiré libère le créneau.
- Un ID de transaction déjà utilisé est refusé.
- Le jeton d'un autre RDV renvoie 404.

#### RUN-08 — L1.5 Back-office réservations et saisie express + L1.7 Clients (L)

**L1.5 — Réservations**
- Recherche et filtres.
- Cycle de vie avec motifs (annulation, no-show) ; historique des changements ; notes internes.
- **Saisie express** pour la réception : client retrouvé par téléphone → soin → créneau proposé.
- Export CSV soumis à permission et audité.

**L1.7 — Clients**
- Fiche, historique, préférences, tags.
- Consentements horodatés.
- Contre-indications chiffrées, lecture journalisée, drapeau pour la réception.
- Détection des doublons (E.164) et fusion manuelle.
- Export d'une fiche ; anonymisation.

**Acceptation**
- Saisie express **< 30 s**, chronométrée par Yass.
- La matrice d'accès aux contre-indications est respectée.
- Les statistiques survivent à l'anonymisation.

#### RUN-09 — L1.8 Lignes WhatsApp N1 + L1.9 Notifications et tableaux de bord (L)

**L1.8 — Lignes WhatsApp**
- Registre des lignes : E.164, sites, horaires, ligne de repli.
- Agents assignés.
- Routage par site et par horaire.
- Modèles à variables, avec aperçu.
- Boutons depuis un RDV : confirmation, rappel J-1, relance d'acompte.
- Liste « rappels à envoyer ».
- Journal « ouvert par X à T » : on enregistre l'ouverture, jamais un « envoyé ».
- En staging, liens sans destinataire.

**L1.9 — Notifications et tableaux de bord**
- Centre de notifications (SSE) : destinataires par rôle × site, non-lus, préférences, heures silencieuses.
- Événements : nouvelle réservation, acompte à valider, hold qui expire, annulation, déplacement, conflit.
- Tableaux de bord par rôle — direction, gérante, réception, praticienne — avec des **KPI calculés uniquement**.

**Acceptation**
- La réception d'un site ne reçoit pas les notifications d'un autre site.
- Routage correct selon le site et l'heure.
- Aucun contenu libre de message stocké.

#### RUN-10 — L1.10 Tag `core-v1.0`, création des apps, staging (L)

**Prérequis Yass** : dépôts vides `mahaza-app` et `stlouis-app` ; configuration Dokploy selon `RUNBOOK.md`.

**Périmètre**
- Taguer la souche `core-v1.0`.
- Créer les deux dépôts depuis le tag : historique propre, remote `upstream` = souche.
- **Marque Mahaza** :
  - thème premium et médias récupérés de `mahaza-demo` ;
  - noms réels des 5 sites et des soins ;
  - tout le reste FICTIF.
- **Marque St Louis** :
  - identité rouge / bleu nuit / crème, contrastes recalculés ;
  - visuels SVG ou libres de droits, sans visage ;
  - données FICTIVES.
- Activer les workflows de release GHCR.
- Déployer le staging par IP:port.
- Bootstrapper les super admins (§3).

**Acceptation**
- Les deux apps tournent indépendamment.
- `git diff upstream/main -- src/core` est vide.
- L'empreinte sur le KVM est conforme aux mesures.
- `mahaza-demo` est toujours en ligne.

### Phase 2 — Spécificités et mobilité

Les évolutions génériques se font dans la souche puis sont mergées ; la marque se fait dans l'app.

#### RUN-11 — St Louis (L)
- **Socle** :
  - file d'attente walk-in (`walkInQueue` : QR → file → lien WhatsApp « bientôt votre tour », estimation d'attente) ;
  - acompte modulé selon la fiabilité du client (`depositByReliability`) ;
  - mineurs : contact d'un parent.
- **App** : identité finale, catalogue barbershop FICTIF, profils de barbiers.

#### RUN-12 — Mahaza (L)
- **Socle** : réservation groupée et « mariée / événement » (`groupBooking`).
- **App** : page « soins par intention », finitions premium, mode économie de données.

#### RUN-13 — PWA du personnel + Web Push (M) — ⚠️ **HTTPS requis**
- Manifest et `sw.js` natifs par marque.
- Agenda du jour lisible hors ligne, avec l'heure de dernière mise à jour ; **aucune écriture hors ligne**.
- Aide à l'installation sur iOS.
- Clés VAPID ; push envoyés par le worker, **sans donnée sensible** ; le centre de notifications reste la source de vérité.

### Phase 3 — Gestion complète (ordre à confirmer avec le client)

- **RUN-14** — Caisse et encaissements (sans encaissement en ligne) :
  - saisie MoMo / OM / espèces ;
  - remises, pourboires, remboursements ;
  - clôture de caisse ;
  - reçu PDF / WhatsApp (❓ obligations fiscales).
- **RUN-15** — Fidélité, forfaits de séances, cartes cadeaux réelles, abonnements.
- **RUN-16** — Stock (seuils, consommation par soin) + RH (horaires, congés, commissions, documents à accès restreint).
- **RUN-17** — Rapports (CA, remplissage, no-show, rétention, exports) + marketing avec opt-in + avis.
- **RUN-18** — Pilote WhatsApp Cloud API sur une agence, sur décision budgétaire.

### Mise en service (RUN-GL)

1. VPS client + Dokploy, domaine, HTTPS.
2. Données réelles, comptes réels.
3. Sauvegardes **hors serveur** + test de restauration.
4. Fiche d'une page par rôle.
5. Pack conformité validé par un juriste.
6. Bascule, puis archivage de `mahaza-demo`.

### Après livraison, sur devis

Lookbook et questionnaire de style → essayage en réalité augmentée ; assistant IA WhatsApp.

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

---

## 7. Hors périmètre v1

Glisser-déposer dans le planning · comptes clients · anglais · encaissement en ligne · e-mail · WhatsApp Cloud API (phase 3, pilote) · réalité augmentée / 3D / IA (après livraison).
