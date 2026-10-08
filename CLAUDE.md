# CLAUDE.md — ovatech-spa-core (souche OVAGLOW)

> Règles de l'agent d'exécution. Autoportant : tout ce qu'il faut savoir est dans ce dépôt.
> Ordre de vérité : ce fichier > `docs/STANDARDS.md` > `docs/PLAN.md` > `docs/DECISIONS.md` > habitudes de l'agent.

## 1. Mission

Souche **privée** d'un logiciel de gestion d'institut de beauté et de barbershop (réservation, agenda, clients, catalogue, équipe, WhatsApp, notifications, puis caisse, fidélité, stock, RH, rapports).
- Marque de démonstration de la souche : **OVAGLOW** (fictive).
- Elle sert de base à deux dépôts clients créés depuis un tag : `mahaza-app` (institut, 5 sites) et `stlouis-app` (barbershop).
- La souche n'est **jamais déployée** : CI uniquement.
- Contexte client (lecture seule) : `nothineazi/mahaza-demo`, fichier `docs/refonte-1-cadrage.md`. Respecter ses repères : ✅ vérifié · 🔎 source externe · ⚠️ hypothèse · ❓ à confirmer. Ne jamais transformer une hypothèse en fait.

## 2. À lire avant toute action

1. Ce fichier.
2. `docs/STANDARDS.md` (stack, normes, sécurité, design, tests, discipline).
3. `docs/PLAN.md` — section du run en cours.
4. `docs/DECISIONS.md` (ADR) et le dernier `docs/runs/RUN-NN.md`.

## 3. Mode de travail : autonome, par RUN

- Le travail est découpé en **runs** (voir `docs/PLAN.md` §5). Un run = un ou plusieurs lots, livrés complets.
- **Pendant un run, tu ne demandes aucune confirmation.** Tu exécutes, tu testes, tu corriges, tu commits.
- **Ambiguïté** : choisis l'option la plus sûre, réversible et conforme à `STANDARDS.md` ; consigne-la dans `docs/DECISIONS.md` avec le statut `À VALIDER` ; continue.
- **Tu t'arrêtes uniquement si :**
  1. le run est terminé ;
  2. il te manque un secret ou un accès (dis exactement quoi configurer) ;
  3. une action serait destructive **hors de ce dépôt** ;
  4. une demande contredit une règle non négociable (§4) ;
  5. un même blocage persiste après 3 tentatives méthodiques (débogage systématique : reproduire, isoler, hypothèse, test). Documente-le dans le rapport ; si la suite du run reste faisable, continue, sinon arrête-toi.
- Utilise une liste de tâches pour suivre le run ; coche au fil de l'eau.
- **Configurations à faire par Yass** (secrets, tokens, Dokploy, GitHub) : ne les demande **qu'au run où elles deviennent nécessaires**. Donne alors un guide **pas à pas** : où cliquer, quoi copier, commandes en PowerShell, et comment vérifier que c'est bon. Fais tout ce qui ne dépend pas de lui avant de t'arrêter.
- **Runs sensibles** (auth, autorisation/RLS, acompte, lien client, données santé) : avant la PR, fais une **passe de revue sécurité dédiée** (relecture ligne à ligne contre `STANDARDS.md` §4–§6 + tests d'attaque : IDOR, contournement de permission, rejeu, énumération) et consigne-la dans le rapport.
- Si un outil, skill ou commande utile existe dans ton environnement (`/simplify`, revue de code, checklist sécurité, worktrees, débogage systématique, vérification avant complétion), utilise-le sans demander.

## 4. Non négociables

- **Aucun secret** dans le dépôt, l'image ou les logs. Variables d'environnement uniquement ; `.env.example` documenté.
- **Jamais `npm audit fix --force`.** Aucune montée de version **majeure** sans ADR et GO de Yass. Exception actée le 2026-10-08 : Next.js 16 et les dépendances que cette migration exige.
- **Aucune donnée inventée présentée comme réelle** : prix, adresses, durées, numéros, personnes, KPI, avis. Tout est marqué **FICTIF** (voir `STANDARDS.md` §9).
- **Pas de compte client** (lien sécurisé envoyé par WhatsApp). **Pas de glisser-déposer** dans le planning. **FR uniquement.** **L'app n'encaisse rien** (acompte manuel).
- **Stack figée** (`STANDARDS.md` §1) : pas de Supabase, Neon, Redis, Prisma, Auth.js, next-pwa/Serwist, ni de service tiers non listé sans ADR.
- **Sécurité côté serveur à chaque accès** : jamais de contrôle d'accès uniquement dans le `proxy`/middleware ou l'interface.
- **`nothineazi/mahaza-demo` est en lecture seule** : aucun commit, aucun push.
- **Jamais de push direct sur `main`.** Une branche et une PR par run ; Yass merge.
- Copy public : jamais « Orange Cameroun » / OCM. Orange Money et MTN MoMo peuvent être nommés comme moyens de paiement.
- La **documentation est mise à jour dans le même run** que le code (§6).

## 5. Environnement

- Agent : sandbox Linux. Yass : **Windows 11 + PowerShell**, sans WSL. Les scripts `npm` doivent fonctionner sur les deux ; les commandes données à Yass sont en **PowerShell**.
- Postgres pour les tests locaux, essayer dans l'ordre : Docker → paquet système `postgresql` → paquet npm `embedded-postgres`. Consigner la méthode retenue dans le rapport. **La CI GitHub Actions (service Postgres) fait foi.**
- Ne jamais lancer `next build` ni supprimer `.next` pendant qu'un `next dev` tourne.
- Après toute installation de dépendance : vérifier que `package-lock.json` est modifié et committé ; `npm ci` doit passer.

## 6. Définition de « terminé » (chaque lot)

- [ ] Typecheck, lint, tests unitaires, intégration, e2e : verts (localement **et** en CI une fois la CI en place).
- [ ] Testé dans un vrai navigateur (Playwright) à 375 px et 1280 px pour tout changement d'interface. « Ça compile » ≠ « ça marche ».
- [ ] Image Docker construite et démarrée ; `/api/health` répond 200 (dès qu'un Dockerfile existe).
- [ ] Scan de secrets propre ; `npm audit` trié dans `docs/SECURITY.md`.
- [ ] Données non fournies marquées FICTIF (base + écran).
- [ ] Docs à jour : `README.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/SECURITY.md`, `CHANGELOG.md`, `docs/RUNBOOK.md` (dès L0.6).
- [ ] Séquence avant push : tests verts → simplification → revue → checklist sécurité → scan secrets → push.

## 7. Git

- Branche du run : `run/NN-slug` depuis `main` à jour.
- Commits fréquents, Conventional Commits en français. Scope `core` pour tout changement du socle (`feat(core): …`), `brand` pour la marque.
- Fin de run : push de la branche, **PR vers `main`** intitulée `Run NN — <titre>`, description = résumé du rapport. Ne pas merger.

## 8. Fin de run (obligatoire)

1. Écrire `docs/runs/RUN-NN.md` :
   - fait / non fait ;
   - écarts au plan ;
   - décisions `À VALIDER` ;
   - résultats de tests (chiffres) ;
   - mesures (poids JS, mémoire si pertinent) ;
   - risques ouverts ;
   - prochain run.
2. Push + PR.
3. Message final à Yass : **≤ 15 lignes** + une **checklist de vérification de ≤ 10 points, faisable en ≤ 10 minutes**. Commandes en PowerShell ; URL de la PR.
