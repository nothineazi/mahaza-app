# mahaza-app — Mahaza Beauty

Logiciel de gestion et de réservation de **Mahaza Beauty** (spa et institut de beauté, 5 sites à Douala et Yaoundé). Dépôt client **privé**, dérivé de la souche `ovatech-spa-core`.

- **État actuel : version de démonstration** (RUN-P). Front sans base de données ni authentification ; l'état est conservé dans l'onglet du navigateur (bouton « Réinitialiser la démo » dans le back-office). Le backend arrive aux runs A, B et C (voir `docs/PLAN.md`).
- **Données** : *réels* — le nom de la marque, les noms des 5 sites et des soins (ancien site) ; **FICTIFS et marqués à l'écran** — prix, durées, adresses, numéros (MoMo, WhatsApp), horaires (à confirmer par site), personnel, clients, réservations.
- En dehors de la production (`APP_ENV` ≠ `production`), un bandeau « Version de développement – données fictives » est affiché et les liens WhatsApp n'ont pas de destinataire.
- Médias (logo, photos) : ancien site de la marque ; droits et consentements des personnes photographiées à confirmer avant la production.

> Lire d'abord `CLAUDE.md`, puis `docs/STANDARDS.md`, `docs/PLAN.md` et `docs/DECISIONS.md`.

## Prérequis

Node.js 24 (voir `.nvmrc`), npm, Git ; Docker Desktop (optionnel, pour l'image).

## Commandes (PowerShell)

```powershell
npm ci                                   # installer
$env:APP_ENV = "staging"                 # development | staging | production
npm run dev                              # http://localhost:3000
npm run verify                           # types, lint, tests, contrastes, anti-fuite, garde-fou design
npm run build ; npm start                # build de production puis serveur autonome
npx playwright install chromium ; npm run e2e   # e2e à 375 et 1280 px (après npm run build)

docker build -t mahaza-app .
docker run --rm -p 3000:3000 -e APP_ENV=staging mahaza-app
Invoke-WebRequest http://localhost:3000/api/health   # StatusCode 200
```

Variables : `APP_ENV` (`development` par défaut, `staging`, `production`), `PORT` (3000), `HOSTNAME` (0.0.0.0). Aucun secret à ce stade ; `.env*` est ignoré par Git (voir `.env.example`).

## Ce que cette app modifie (et rien d'autre)

`src/brand/` (marque, thème OKLCH, polices, vocabulaire, textes, seed), `public/brand/`, `src/app/icon.png`, `package.json` (nom, description), ce `README.md`, `CHANGELOG.md`, `docs/` et `.github/workflows/release.yml`. **`src/core` et `src/ui` ne sont jamais modifiés ici** : une évolution du socle se fait dans la souche.

```powershell
git diff upstream/main -- src/core src/ui     # doit être vide
```

## Recevoir les évolutions du socle

```powershell
git remote add upstream https://github.com/nothineazi/ovatech-spa-core.git   # une seule fois
git fetch upstream --tags
git checkout -b run/merge-socle
git merge upstream/main          # conflit sur README.md, CHANGELOG.md ou package.json : garder la version de cette app
npm ci ; npm run verify          # puis PR vers main
```

Après chaque run A, B ou C de la souche : merge, CI verte, redéploiement du staging.

## Déploiement

Image publiée par la CI sur `ghcr.io/nothineazi/mahaza-app` (`latest` et SHA du commit). Déploiement du staging sur Dokploy : `docs/RUNBOOK.md`.
