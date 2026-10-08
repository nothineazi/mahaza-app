# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Les versions de la souche sont des tags `core-vX.Y` (le premier : fin du RUN-10).

## [Non publié] — RUN-01 : création de la souche OVAGLOW et migration Next.js 16

### Ajouté
- Souche issue d'un import propre de `mahaza-demo@656cfc7` (sans historique, sans média ni contenu Mahaza).
- Marque fictive **OVAGLOW** : thèmes clair et sombre (jetons CSS), wordmark texte, favicon et icônes SVG, illustrations SVG générées, jeu de données FICTIF (3 sites, 20 soins, praticiens, salles, réservations).
- Bandeau « Version de développement – données fictives » et liens WhatsApp sans destinataire tant que `APP_ENV` ≠ `production`.
- Mention « FICTIF – ne pas payer » sur les numéros d'acompte.
- `brand.config.ts` : nom, fonctionnalités (`walkInQueue`, `groupBooking`, `depositByReliability`, à `false`), politiques par défaut.
- Contrôles : contrastes WCAG AA (clair et sombre), anti-fuite de marque, budget de First Load JS.
- Tests Playwright à 375 et 1280 px (accueil, réservation multi-soins, back-office, axe), sonde `/api/health`.
- CI GitHub Actions (typecheck, lint, tests, contrastes, anti-fuite, build, budget, e2e, image Docker).
- Documentation : README, ARCHITECTURE, DECISIONS (34 ADR), SECURITY, rapports `docs/runs/RUN-01*.md`.

### Modifié
- **Next.js 15.5.27 → 16.4.0** (codemod officiel), React 19.3.0, ESLint en flat config native, build Turbopack.
- Structure `src/{app,core,brand,ui}` ; l'alias `@/*` pointe sur `src/*`.
- Image Docker : `HEALTHCHECK`, `APP_ENV` lu à l'exécution, plus de `NEXT_PUBLIC_THEME`.

### Supprimé
- Rendu legacy St Louis, `NEXT_PUBLIC_THEME`, tous les aiguillages de thème.

### Corrigé
- Débordement horizontal du tableau de bord à 1280 px (infobulle du graphique) et du bouton « Générer ma carte cadeau » à 375 px.

### Sécurité
- Next 16 supprime l'alerte `npm audit` sur le PostCSS embarqué par Next ; 10 alertes subsistent, toutes dans la chaîne de build Tailwind 3 (voir `docs/SECURITY.md`).
