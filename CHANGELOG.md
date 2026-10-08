# Changelog

Format : [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/). Les versions de la souche sont des tags `core-vX.Y` (le premier : fin du RUN-10).

## [Non publié] — RUN-01b : fondations design et outillage

### Modifié
- **Node.js 22 → 24 LTS** (`.nvmrc`, `engines`, Dockerfile, `@types/node` 24) ; ADR-019.
- **Tailwind CSS 3.4 → 4.3.3**, configuration CSS-first (`@theme`), outil officiel de migration ; `tailwindcss-animate` remplacé par `tw-animate-css` ; ADR-035. Rendu public inchangé.

### Ajouté
- **Couche design factory** (`docs/reference/factory-core.md`, ADR-036) : deux registres, jetons OKLCH (neutres teintés H = 200), mode sombre par classe `.dark` (`next-themes`) avec bouton clair/sombre, échelle `text-kv-*`, graisses 450/520/600, composants `src/ui/kv` (Panel, StatusBadge, Field, PageHeader, StateBlock, DataTable, ActionBar, Segmented, control-classes), coque à barre latérale, `cn()` étendu.
- `scripts/check-design.mjs` (périmètre back-office, exceptions déclarées) ; `scripts/check-contrast.mjs` réécrit en OKLCH (80 couples par thème).
- Polices **auto-hébergées** (`next/font/local`) : Inter, Cormorant Garamond, JetBrains Mono, licences OFL versionnées (ADR-038).

### Modifié
- Les couleurs de la marque ne sont plus en canaux RGB ; l'accent doré du site public s'appelle `gold` (le nom `accent` a le sens factory) ; filet décoratif `line` pour le site public.
- Le fond du site public passe du crème au gris-teal neutre de la recette ; le thème sombre est plus profond.
- Plus d'italique (carte cadeau, pied de page), plus de police mono sur le site public.

### Supprimé
- `next/font/google` : le build ne contacte plus aucun service de polices.

### Corrigé
- Pastille d'état « Active » (salles, équipe) : son fond vert pâle (`bg-success/12`) est enfin appliqué (opacité ignorée par Tailwind 3).

### Sécurité
- `npm audit` : 10 → 5 alertes (chaîne Tailwind 3 supprimée) ; reste une chaîne d'outil de lint, triée dans `docs/SECURITY.md`.

## [Non publié] — RUN-01 : création de la souche OVAGLOW et migration Next.js 16

### Ajouté
- Souche issue d'un import propre de la démo d'origine (commit 656cfc7, sans historique, sans média ni contenu de marque cliente).
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
- Rendu legacy du second client, `NEXT_PUBLIC_THEME`, tous les aiguillages de thème.

### Corrigé
- Débordement horizontal du tableau de bord à 1280 px (infobulle du graphique) et du bouton « Générer ma carte cadeau » à 375 px.

### Sécurité
- Next 16 supprime l'alerte `npm audit` sur le PostCSS embarqué par Next ; 10 alertes subsistent, toutes dans la chaîne de build Tailwind 3 (voir `docs/SECURITY.md`).
