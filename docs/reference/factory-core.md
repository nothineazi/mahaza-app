# SaaS Factory — design system, core

Socle commun de tous les produits du portfolio et des projets clients. **Aucune valeur de marque ici** : couleurs, polices, logo, copy vivent dans `themes/<produit>.md` (voir `themes/_template.md`, exemple rempli : `themes/koverit.md`). Seules exceptions, des constats d'audit et non des définitions : le tableau de mesures du §9 et le tableau d'écarts du §13, qui citent Koverit.

- **Dérivé de** Koverit, commit `8f23d18` (2026-10-05), relu contre le code réel : `app/globals.css`, `components/kv/*`, `lib/utils.ts`, `scripts/check-design.mjs`, `app/layout.tsx`, `app/manifest.ts`, `public/sw.js`.
- **Hiérarchie de vérité** : le repo du produit (code) > ce fichier > `docs/DESIGN_SYSTEM.md` de Koverit (spec d'origine, partiellement dépassée). Les écarts connus entre spec et code sont au §13 — à lire avant de recopier quoi que ce soit.

---

## 1. Principes

> **De l'air entre les groupes, pas dans les composants.**

Composants serrés (16 px de padding, lignes de tableau de 40 px), séparations franches entre groupes (24-32 px). On doit pouvoir compter les blocs d'une page d'un coup d'œil.

1. **Un seul élément dominant par écran** (un chiffre clé, une action primaire).
2. **La couleur porte le sens, jamais la décoration.** Accent = action ou lien. Vert / ambre / rouge = état. Tout le reste est neutre.
3. **La bordure porte la profondeur, pas l'ombre.** Ombres réservées aux surfaces qui flottent (dropdown, tooltip, toast, sheet, modale).
4. **Produit B2B premium** : dense, précis, sobre, jamais « généré ». Densité compacte (corps 13 px), référence desktop **1280 px** (le fondateur travaille à 150 % de mise à l'échelle Windows : viewport CSS réel = 1280).
5. **Deux registres** : l'app (`/app/*`, auth, pages tierces) suit strictement ce système ; la landing garde un registre marketing (typo plus grande, animations) et ne partage que les tokens de couleur.

---

## 2. Tokens (`app/globals.css`)

### 2.1 Organisation du fichier

| Bloc | Rôle | Piège |
|---|---|---|
| `@theme { --text-kv-* }` | Échelle typographique | **Sans `inline`** : les valeurs doivent rester des variables CSS pour être redéfinies sous media query (mobile). Avec `@theme inline` elles sont figées à la compilation et la media query ne fait rien. |
| `@theme inline { --color-status-* }` | Expose les tokens de statut en classes (`bg-status-paid-bg`) | — |
| `@theme inline { --color-*, --font-*, --radius-*, --font-weight-* }` | Pont shadcn : variables → classes Tailwind | `--font-sans` doit pointer vers la variable **de la police réelle** (`--font-geist-sans`…), jamais vers lui-même. |
| `:root { … }` / `.dark { … }` | Valeurs clair / sombre | Le thème sombre est piloté par la **classe** `.dark` (next-themes `attribute="class"`), pas par `prefers-color-scheme`. |
| `@media (max-width: 639px) { :root { --text-kv-* } }` | Surcharge mobile | Voir §3. |
| `:root { color-scheme: light } / :root.dark { color-scheme: dark }` | Contrôles natifs (checkbox, date, scrollbar) | Sans ça ils restent clairs en sombre. |

### 2.2 Rôles des tokens de couleur

Les valeurs sont dans le thème. Contraintes WCAG : §9.

| Token | Rôle | Règle |
|---|---|---|
| `--background` | Fond de page | **Légèrement plus sombre que `--card`** en clair (les cartes se détachent sans ombre). Ne jamais le remettre à blanc pur. |
| `--card` / `--popover` | Surfaces (cartes, tableaux ; menus, dialogs) | Plus claires que le fond en clair, plus claires aussi en sombre. |
| `--foreground` / `--card-foreground` / `--popover-foreground` | Texte principal | Neutre pur (chroma 0). |
| `--primary` / `--primary-foreground` | **Accent de marque** : bouton principal, lien, focus, état actif | Le couple doit passer 4,5:1 (texte du bouton). Valeur différente en sombre. |
| `--primary-text` | **Accent utilisé comme texte** (lien, libellé, pastille sur `info-bg`). Classe `text-primary-text` | Existe parce que `--primary` (fond de bouton, calé pour que le texte blanc passe 4,5:1) ne passe pas 4,5:1 en **texte** sur `card` en sombre. Clair = `--primary` ; sombre = plus clair. Vérifier ≥ 4,5:1 sur `card`, `background` et `info-bg`. `text-primary` reste réservé aux **icônes** (3:1 suffit) |
| `--secondary`, `--accent` (+ `-foreground`) | Surfaces teintées discrètes : survol, élément actif, pastille de plan | Teinte de marque, chroma faible. |
| `--muted` / `--muted-foreground` | Fond atténué / texte secondaire | `muted-foreground` doit passer 4,5:1 sur `background`, `card` **et** `muted` (il sert aussi de texte des badges « brouillon »). |
| `--destructive` | Erreur, suppression | Texte ≥ 4,5:1 sur `card`. |
| `--border` | Bordure de carte, de tableau | ≥ 3:1 contre `background` et `card` en clair (WCAG 1.4.11). |
| `--input` | Bordure de champ | ≥ 3:1 (le contour d'un champ identifie le composant). |
| `--ring` | Anneau de focus | = accent. |
| `--chart-1…5` | Rampe de graphiques | Cinq pas de clair à foncé d'une même teinte. Aucune dataviz n'existe aujourd'hui (voir §14). |
| `--sidebar*` | Surface et accents de la sidebar | **Suit le thème** (plus de bloc de couleur fixe). |
| `--success` / `--warning` + `-bg` ; `--danger-bg` ; `--info-bg` | Couleurs sémantiques | Valeurs hex/rgba, versions clair et sombre distinctes. |
| `--status-{paid,overdue,pending,draft}-{fg,bg}` | **Tokens de statut** (facture, relance, risque…) | Alias vers les tokens sémantiques ; seul `--status-overdue-fg` a sa propre valeur (rouge plus foncé en clair, plus clair en sombre). |
| `--gradient-to`, `--shadow-card` | **Legacy** (landing, `EmptyState` ancien) | Ne pas utiliser dans l'app. `--shadow-card` vaut `none` en sombre. |

**Recette des neutres teintés** (observée sur Koverit ; `H` = teinte de marque, fournie par le thème). Les ratios L/C sont structurels, la teinte seule est une valeur de marque :

| Token (clair) | L / C | Token (sombre) | L / C |
|---|---|---|---|
| `background` | 0,985 / 0,002 | `background` | 0,13 / 0,02 |
| `card`, `popover` | 1 / 0 | `card`, `popover`, `sidebar` | 0,18 / 0,03 |
| `muted` | 0,96 / 0,02 | `muted`, `secondary`, `accent`, `sidebar-accent` | 0,25 / 0,04 |
| `secondary`, `accent`, `sidebar-accent` | 0,94 / 0,04 | `muted-foreground` | 0,65 / 0,08 |
| `sidebar` | 0,97 / 0,02 | `border` | blanc 10 % |
| `sidebar-border` | 0,90 / 0,03 | `input` | blanc 15 % |
| `muted-foreground` | 0,50 / 0,08 | `foreground` | 0,985 / 0 |
| `secondary-foreground`, `accent-foreground`, `sidebar-accent-foreground` | 0,35 / 0,18 | | |
| `border`, `input` | **0,653 / 0,03** (≥ 3:1) | | |
| `foreground` | 0,145 / 0 | | |

Un nouveau produit part de cette recette, change `H` et l'accent, puis **revérifie les contrastes** (§9) — ne jamais supposer que ça passe.

### 2.3 Polices (rôles)

| Variable | Rôle |
|---|---|
| `--font-sans` | Corps de texte (police variable, graisses 450 / 520 / 600) |
| `--font-display` | Marque : wordmark du logo, **titres de page** (`PageHeader`) |
| `--font-mono` | Code, références |

Chargement : police du corps via le package de la police ; police d'affichage via `next/font/local` (fichier allégé, sous-ensemble latin). Les `variable:` CSS sont posées sur `<html>`.

### 2.4 Graisses

Police variable → on redéfinit l'échelle dans `@theme inline` : `medium` 450, `semibold` 520, `bold` 600, `extrabold` 650, `black` 700.

| Graisse | Usage |
|---|---|
| 450 | Tout le corps, valeurs de tableau |
| 520 | Titres, libellés, onglet actif, bouton |
| 600 | **Uniquement** le chiffre clé et les montants en contexte de paiement |
| 700 | **Interdit dans `/app/*`**, réservé au hero de la landing |

Conséquence piège : `font-semibold` (= 520) et `font-bold` (= 600) ne sont pas les graisses CSS standard. Ne pas importer de snippets shadcn / Tailwind en supposant 600 / 700.

---

## 3. Échelle typographique

Un token = un rôle. Dans `/app/*` : **interdit** d'utiliser `text-sm`, `text-xs`, `text-[11px]`.

| Token | Taille / interligne | Graisse | Rôle |
|---|---|---|---|
| `text-kv-display` | 30 / 34 px (mobile 26) | 600, tracking −0,02em | Chiffre clé unique d'un écran |
| `text-kv-title` | 18 / 24 px | 520, tracking −0,01em | Titre d'écran « fonctionnel » (voir écart n° 1 §13) |
| `text-kv-section` | 14 / 20 px | 520 | Titre de carte, de fiche latérale, d'état |
| `text-kv-body` | 13 / 20 px (mobile 14 / 22) | 450 | Corps, cellules, valeurs |
| `text-kv-meta` | 12 / 16 px (mobile 13) | 450 | Dates, compteurs, aides — toujours `text-muted-foreground` |
| `text-kv-label` | 11 / 14 px | 520, `uppercase`, tracking 0,04em | Libellés de colonne et de champ — `text-muted-foreground` |

- **Mobile < 640 px** : corps 14 px (lecture en plein soleil sur Android d'entrée de gamme ; la contrainte de densité du 13 px n'existe pas sur mobile), meta 13 px, display 26 px. Redéfini sous media query sur `:root`.
- **Chiffres** : tout montant, compteur ou date en colonne porte `tabular-nums`.
- **`cn()` doit être étendu** (`lib/utils.ts`, `extendTailwindMerge`, groupe `font-size` avec les six `kv-*`). Sans ça, `tailwind-merge` prend `text-kv-body` pour une couleur et supprime `text-muted-foreground` (ou l'inverse).
- Un token `kv-label` embarque `letter-spacing` : un composant qui l'utilise hors contexte uppercase doit le neutraliser (`normal-case tracking-normal`, voir `StatusBadge`).

---

## 4. Espacement, contrôles, rayons, élévation

**Espacement (base 4 px)**

| Usage | Valeur | Classe |
|---|---|---|
| Padding de page | 20 px (16 px < 768 px) | `p-4 md:p-5` |
| Padding de carte | 16 px | `p-4` |
| Cellule de tableau | 12 px horizontal, 0 vertical | `px-3` |
| Entre éléments d'un groupe | 8 px | `gap-2` |
| Entre groupes d'une carte | 16 px | `gap-4` |
| Entre blocs de page | 24 px | `space-y-6` |
| Entre sections sans rapport | 32 px | `space-y-8` |

Bannis dans `/app/*` : `p-6`, `py-16`, `space-y-8` dans une carte, `gap-3`.

**Hauteurs de contrôle**

| Contrôle | Desktop | Mobile |
|---|---|---|
| Bouton | 32 px (`h-8`) | 44 px (`h-11`) |
| Bouton primaire d'écran | 36 px (`h-9`) | 44 px |
| Champ | 32 px | 44 px, **police 16 px** (anti-zoom iOS) |
| Ligne de tableau | 40 px | carte empilée |
| Badge | 20 px (`h-5`) | 20 px |
| Élément de navigation | 32 px | 44 px |
| Segmented | 28 px (`md:h-7`) | 36 px (`h-9`) |

Forme type : `h-11 md:h-8`. Le 44 px tactile ne s'applique **qu'au mobile** ; l'imposer au desktop produit l'effet « zoomé ». Classes prêtes dans `components/kv/control-classes.ts` (§5.8).

**Rayons** (`--radius` = 0,5 rem ; échelle dérivée : sm 0,6×, md 0,8×, lg 1×, xl 1,4×)

| Élément | Classe | Pixels |
|---|---|---|
| Bouton, champ, badge carré | `rounded-md` | 6,4 |
| Carte, panneau, tableau | `rounded-lg` | 8 |
| Modale, fiche latérale | `rounded-xl` | 11,2 |
| Pilule (statut, plan, filtre) | `rounded-full` | — |

`rounded-2xl/3xl/4xl` interdits dans `/app/*` (landing seulement). Une seule bordure entre deux blocs adjacents.

**Élévation** : 0 = bordure seule (contenu, cartes, tableaux) ; 1 = `shadow-md` (dropdown, tooltip, toast) ; 2 = `shadow-lg` + overlay (sheet, modale). Le pouce actif d'un `Segmented` utilise `shadow-sm` (seule exception, c'est un indicateur de sélection, pas une surface flottante).

---

## 5. Composants (`components/kv/`)

Les composants `kv` **composent** `components/ui/*` (shadcn), ils ne le remplacent pas. **On ne modifie jamais `components/ui/*`** : on étend par `className`.

> ⚠️ **Défauts shadcn qui contredisent le système** (vérifié dans `button.tsx`, `input.tsx`) : `Button` = `h-8` fixe, `text-sm`, `rounded-lg` ; `Input` = `h-8` fixe, `text-base md:text-sm`, `rounded-lg`. Aucun passage à 44 px sur mobile, tailles hors tokens `kv`. Pour un champ ou bouton d'app, ajouter `h-11 md:h-8` + `text-kv-body` ou utiliser `control-classes.ts`.

### 5.1 `Panel`, `PanelHeader`
```tsx
<Panel className?>            // <section> rounded-lg border bg-card p-4 — props de <section> héritées
<PanelHeader title action? className? />   // h2 text-kv-section truncate, mb-4, action à droite
```
Pas d'ombre, pas de dégradé. Un panneau = un sujet.

### 5.2 `StatusBadge`
```tsx
type StatusTone = "paid" | "overdue" | "pending" | "draft";
<StatusBadge tone className?>{children}</StatusBadge>   // h-5 rounded-full px-2 text-kv-label normal-case tracking-normal
```
Un seul composant pour statuts de facture, niveaux de relance, niveaux de risque. **Un badge coloré par ligne au maximum** ; un second signal (ex. risque) passe en point coloré de 6 px + texte neutre. Jamais de `<span className="text-xs px-2 …">` écrit à la main. Il n'existe **pas** de ton `info` / neutre-marque : une pastille de plan est aujourd'hui recréée à la main (voir §13 n° 12).

### 5.3 `Field`
```tsx
<Field label hint? error? required? htmlFor? className?>{input}</Field>
```
Libellé `text-kv-label uppercase` **au-dessus** (jamais à gauche) ; astérisque `text-destructive` si `required` ; erreur (`role="alert"`, `text-destructive`) **remplace** l'aide ; aide en `text-kv-meta`, seulement si elle apprend quelque chose. Deux colonnes max desktop, une sous 768 px. Bouton d'enregistrement aligné à gauche, `size="default"`, jamais pleine largeur. Attention : `Field` ne passe pas `aria-invalid` au champ — à poser sur l'`Input`.

### 5.4 `PageHeader`
```tsx
<PageHeader title subtitle? action? className? />   // <header> mb-6 flex flex-wrap justify-between ; h1 en font-display text-2xl font-semibold
```
Une seule action primaire. **Piège réel** : `className` est fusionné avec `mb-6` via `cn()` ; passer `mb-0` écrase l'espace sous l'en-tête et colle le sous-titre au contenu (bug corrigé en prod sur dashboard / clients / factures). N'utiliser `className` que pour autre chose que la marge basse.

### 5.5 `StateBlock`
```tsx
<StateBlock icon title text? action? tone?: "neutral" | "error" className? />   // py-10, icône 20 px dans carré 40 px
```
Gabarit commun vide / erreur. Chargement : squelette aux **dimensions exactes** du contenu (lignes de 40 px pour un tableau, bloc de 30 px pour un chiffre clé), jamais un spinner seul au-delà d'une seconde. Erreur : dire ce qui s'est passé **et** quoi faire. ⚠️ Écart n° 7 §13 : ce composant n'est consommé nulle part dans Koverit.

### 5.6 `DataTable<T>`
```tsx
type Column<T> = { id; header; cell:(row)=>ReactNode; priority?:1|2|3; align?:"left"|"right"; sortable?; maxWidth?:string; nowrap? }
<DataTable columns rows rowKey onRowClick? sort? onSort? select? actions? rowAccent? mobileCard />
// sort: {key: string|null; dir:"asc"|"desc"} ; select: {selected:Set<string>; isSelectable; allSelected; onToggle; onToggleAll; label}
```
- Ligne `h-10`, cellules `px-3 align-middle`, jamais renvoyées à la ligne ; colonne texte longue → `maxWidth` (`max-w-[220px]`) = `truncate` + attribut `title` automatique (si le contenu est une chaîne).
- En-tête `h-9`, `text-kv-label uppercase`, `aria-sort` posé, tri par bouton.
- `align:"right"` ⇒ `tabular-nums`. Séparation par `border-b last:border-0`. Survol `hover:bg-muted/50`.
- **Priorité** : 1 toujours visible ; 2 masquée sous `lg` (1024) ; 3 masquée sous `md` (768).
- **Première colonne `sticky left`** (+ colonne de sélection) avec fond opaque, dans un conteneur `overflow-x-auto`.
- **< 640 px** : `<ul>` de cartes via `mobileCard(row)` (pas un tableau scrollable) ; `rowAccent` = classe de bordure gauche 3 px pour l'urgence.
- `actions(row)` = cellule finale, protégée du clic de ligne.

### 5.7 `ActionBar`
```tsx
type BarAction = { label; icon?: LucideIcon; onClick; disabled? }
<ActionBar primary? secondary?: BarAction[] destructive?: BarAction menuLabel: string />
```
**Règle** : UNE action primaire adaptée au statut, mise en avant ; **toutes les autres actions restent visibles en secondaire** (décision fondateur : ne pas cacher ce dont l'utilisateur a besoin) ; seule l'action **destructive** va dans un menu `…` (ouvert vers le haut). Collée en bas de la fiche (`border-t bg-popover`) ; primaire pleine largeur sur mobile. Libellés courts, sans retour à la ligne (« Paiement reçu », « Copier le lien », « PDF »). Sert aussi de pied de formulaire (primaire seule = « Enregistrer ») ; `menuLabel` est obligatoire même sans menu (on passe `""`).
La matrice **statut → action primaire** est une règle métier propre au produit : la faire valider avant de coder, ne pas la copier d'un autre produit.

### 5.8 `Segmented<T>` et `control-classes.ts`
```tsx
<Segmented options={{value,label}[]} value onChange className? />   // filtre à choix unique : période, statut, risque
controlBase | controlPrimary | controlSecondary | fieldControl      // chaînes de classes partagées
```
`Segmented` : bloc discret `bg-muted`, pouce actif `bg-card shadow-sm`, `aria-pressed`, défilement horizontal interne si trop large. `fieldControl` fixe `text-base md:text-kv-body` (16 px mobile = pas de zoom iOS).

### 5.9 Coque d'app (`app/(app)/layout.tsx` + `sidebar.tsx`)
- Sidebar **216 px**, visible ≥ `md` ; sous `md` : en-tête fixe `h-14` + tiroir `fixed` avec overlay (`main` prend `pt-14`). Surface `bg-sidebar`, bordure `border-sidebar-border`, éléments de nav `h-11 md:h-8`, actif `bg-sidebar-accent font-semibold` + icône `text-primary`, `aria-current="page"`.
- Logo en **deux variantes** (clair / sombre) basculées en CSS : `dark:hidden` / `hidden dark:block` (pas de flash).
- Contenu : `<div className="p-4 md:p-5 flex-1">`. Bascule skeleton → contenu : classe `.kv-content-fade` (fondu d'opacité pur 150 ms, une fois, sur la racine de page ; **pas** de translation ni de délai par bloc ; coupé par `prefers-reduced-motion`).
- Compteur de chiffre clé (`Counter`) : s'anime **une fois** au premier affichage (900 ms, ease-out cubique), puis suit la valeur sans animation ; coupé par `prefers-reduced-motion`. Recommandation du plan d'origine (le supprimer) non suivie — voir §13 n° 5.

---

## 6. Responsive

- **Largeurs de test : 375 / 1280 / 1440.** Zone de contenu à 1280 = 1064 px (sidebar 216 déduite), 1024 px après le padding de page de 20.
- Breakpoints Tailwind par défaut : `sm` 640 (cartes ↔ tableau), `md` 768 (sidebar, hauteurs de contrôle), `lg` 1024 (colonnes de priorité 2).
- **À 375 px, non négociable** : aucune zone tactile < 44 × 44 ; **zéro scroll horizontal de page** (seul défilement horizontal admis : un conteneur de tableau explicitement marqué) ; 2 colonnes de grille maximum ; libellés longs raccourcis, pas sur deux lignes ; champs en 16 px.
- Tester avec des **noms longs / accentués** (le jeu de démo en contient ; ils cassent d'abord les tableaux).
- ⚠️ Seuil tactile incohérent (§13 n° 9) : `ActionBar` bascule à `sm` (640), les contrôles à `md` (768).

## 7. Pages publiques tierces (ex. page de paiement débiteur)

Écran vu par des tiers : chaque abandon est un revenu perdu pour le client.
- **L'entité qui facture est devant** (nom en tête du bloc), la plateforme en caution en pied (« Paiement sécurisé via … »).
- **Server Component** qui charge côté serveur ; seul le formulaire est client → contenu affiché avant le JS, essentiel sur 3G. `robots: noindex`, `<title>` explicite.
- Lecture publique par identifiant exact non énumérable via client admin, filtre `saas_id`, pas de policy RLS publique.
- Texte **en dur dans la langue du tiers** (pas celle de l'utilisateur de l'app) : choix documenté dans le fichier.
- Cible `max-w-[400px]`, un seul élément en `text-kv-display` (le montant), CTA pleine largeur 48 px, champ `inputMode="tel"`.
- **Ne jamais laisser le tiers devant un écran sans issue** : état d'attente = carte visible, instructions numérotées, aide (« Renvoyer », « Changer de numéro ») après un délai, bouton d'annulation. Poller avec nettoyage de l'intervalle au démontage (fuite = factures marquées payées à tort), abandon après un plafond.
- États couverts dans Koverit : lien invalide, déjà payée (serveur) ; saisie, attente, succès, échec (client). Le chargement est inutile (SC). Voir §13 n° 8 pour l'écart avec la spec (sept états, reçu).
- Nommer l'opérateur de paiement (ex. OM, MoMo) est **permis et recommandé** : c'est un service tiers intégré, c'est ce qui rassure le débiteur. Ne pas confondre avec l'employeur du fondateur (OCM), interdit dans tout copy (`../global.md`). N'afficher un logo d'opérateur qu'après avoir confirmé ce que le provider de paiement expose.

## 8. PWA

Approche **native** (pas de `next-pwa`/Workbox : dépendance lourde évitée).
- `app/manifest.ts` : `name`, `short_name`, `start_url: "/app"`, `display: "standalone"`, `orientation: "portrait-primary"`, `background_color`, `theme_color`, `lang`, icônes 192 / 512 `any` + 512 `maskable`.
- `app/layout.tsx` : `metadata.manifest`, `appleWebApp` (`capable`, `statusBarStyle: "black-translucent"`), icônes (`favicon.svg`, `apple-touch-icon.png`), `viewport.themeColor`.
- `public/sw.js` : `install` pré-cache un app-shell minimal (+ `skipWaiting`), `activate` purge les anciens caches (+ `clients.claim`). `fetch` : **jamais** les non-GET, les requêtes cross-origin (base de données, paiement), ni `/api/` ; navigation = **réseau d'abord**, repli sur la dernière version vue, puis `offline.html` ; `/_next/static/` et `/assets/` = cache d'abord. **Incrémenter `CACHE_VERSION` à chaque changement de logique de cache**, pas à chaque déploiement (les assets `_next/static` sont hashés).
- Enregistrement du SW en **production uniquement** ; invite d'installation contextuelle (événement `beforeinstallprompt` mémorisé, proposée après un premier succès, une seule fois — flag en `localStorage`).
- **Par produit** : nom, couleurs `theme_color` / `background_color`, jeu d'icônes (192, 512, maskable 512 + source SVG), `og-image`.
- ⚠️ Écart n° 10 §13 : `themeColor` et `background_color` sont figés sur un navy « de chrome toujours sombre » alors que la sidebar suit maintenant le thème.

## 9. Accessibilité — WCAG 2.x AA

Règles : texte normal ≥ **4,5:1** ; grand texte et composants / bordures d'UI ≥ **3:1** ; cible tactile ≥ 44 × 44 (mobile) ; focus visible partout (anneau `ring`, `focus-visible:ring-*`) ; animations coupées sous `prefers-reduced-motion` ; `lang` de `<html>` = locale active ; zones dynamiques en `aria-live="polite"` ; `aria-current="page"` (nav), `aria-pressed` (segmented), `aria-sort` (en-têtes), `role="alert"` (erreurs de champ), `aria-label` sur toute icône seule.

**Vérifier à chaque nouveau thème** (script de calcul OKLCH → sRGB → luminance relative ; ratios arrondis, marge ± 0,05). Mesures sur Koverit, 2026-10-05, à refaire avec les valeurs du thème :

| Couple | Clair | Sombre | Verdict |
|---|---|---|---|
| foreground / background | 18,96 | 19,27 | ✅ |
| muted-foreground / card | 6,03 | 5,80 | ✅ |
| muted-foreground / muted | 5,37 | 4,94 | ✅ |
| primary-foreground / primary (bouton) | 5,03 | 4,61 | ✅ (sombre : marge faible) |
| primary en **texte / lien** sur card | 5,26 | 3,91 → **7,98** avec `--primary-text` | ✅ corrigé 2026-10-05 |
| destructive / card | 4,76 | 6,51 | ✅ |
| status fg / bg : payé · attente · retard | 4,79 · 4,84 · 5,91 | 5,17 · 5,99 · 6,52 | ✅ |
| primary sur `info-bg` (pastille de plan) | 4,83 | 2,25 → **4,88** avec `--primary-text` | ✅ corrigé 2026-10-05 |
| blanc sur `bg-red-500` (ancien badge de retards) | 3,76 | 3,76 | ⚠️ le badge a depuis changé de style (`bg-primary`) ; si un fond rouge revient : `bg-red-700` (6,47) |
| border / card (non-texte) | 3,20 | 2,78 | ✅ clair · ⚠️ sombre (bordure de carte décorative, sous 3:1) |
| input (champ) / card | — | 3,67 | ✅ |

Méthode : composer les couleurs semi-transparentes (`rgba`, blanc 10 %) sur la surface réelle avant de calculer. **Aucun test d'accessibilité automatisé** n'existe dans le repo ; l'affirmation « conforme WCAG AA » de `PROJECT_STATUS.md` n'était pas démontrée avant les corrections du 2026-10-05 (lignes « corrigé » ci-dessus) ; elle reste non testée automatiquement.

---

## 10. Garde-fou `scripts/check-design.mjs`

- Parcourt `app/` et `components/kv/` (`.ts`/`.tsx`), **ignore** `app/[locale]/` (landing), `app/pay/` et `node_modules`.
- Compte trois motifs : `style={{` · `const C = {` · `text-(sm|xs|[\d…)`. Affiche totaux + 8 fichiers les plus touchés.
- **Mode avertissement par défaut (exit 0)** ; `--strict` fait échouer. En CI (`.github/workflows/ci.yml`) il tourne en avertissement non bloquant. Le plan prévoyait de passer en strict à la fin du lot 6 : **pas fait**.
- Mesure Koverit au 2026-10-05 : **135** `style={{}}` · **9** palettes locales · **79** tailles hors tokens ; principaux fichiers : `InvoicePreview.tsx` (PDF, hors périmètre), pages `admin/*`, Copilot, onboarding, auth.
- **Angles morts** : ne vérifie ni `rounded-2xl+`, ni `p-6`, ni `font-bold/black`, ni couleurs hex en dur, ni `components/ui/*` ; le mécanisme d'« exception déclarée en tête de fichier » prévu par la spec n'existe pas dans le script ; les exceptions légitimes (largeur calculée, `--kv-delay`, couleur venant de la base) comptent donc comme des écarts.

## 11. Pièges connus

1. **`--font-sans: var(--font-sans)`** (auto-référence) = police jamais appliquée, repli serif. Pointer vers la variable de la police réelle.
2. **`tailwind-merge` et `text-kv-*`** : voir §3, étendre `cn()`.
3. **`@theme inline` sur la typo** : la media query mobile n'a plus d'effet (§2.1).
4. **Logo SVG utilisé en `<img>`/`next/image`** ne charge pas les polices de la page : convertir le wordmark en **tracés** (fontTools : `instantiateVariableFont` à l'axe voulu puis `SVGPathPen`), sinon rendu différent selon l'appareil (Android).
5. **Logo clair sur sidebar claire** : une sidebar qui suit le thème rend un logo blanc invisible en clair → deux fichiers + bascule CSS.
6. **`PageHeader className="mb-0"`** écrase l'espace sous l'en-tête (§5.4).
7. **Défauts shadcn** (`h-8`, `text-sm`, `rounded-lg`) : voir §5.
8. **Framer-motion dans l'app** = poids JS (~118 Ko gagnés en le retirant de `/app/*`) : animations d'entrée en CSS pur (`.kv-*`) ; `LazyMotion` seulement sur la landing.
9. **Ne jamais lancer `next build` ni supprimer `.next`** pendant que le `next dev` du fondateur tourne (corrompt `.next/dev`, 404 locaux).
10. **Bordure à fort contraste (3:1)** : conforme mais alourdit le rendu ; à réévaluer au cas par cas, ne pas l'« alléger » en dessous du seuil pour les champs.
11. **Next.js 16** : lire `node_modules/next/dist/docs/` avant d'écrire du code ; les conventions diffèrent de Next 15 (le `CLAUDE.md` du template annonce encore « Next.js 15 », alors que `package.json` est en `^16.2`).
12. **Sidebar : pastille de plan** codée avec des couleurs hors `StatusBadge` (`PLAN_COLOR`) : ce que le système interdit ailleurs. Utiliser `text-primary-text` (pas `text-primary`) pour tout texte d'accent.
13. **Statut « terminé » prématuré** : un lot UI n'est clos que après vérification visuelle du fondateur (4 combinaisons, §12), pas après `tsc`.

---

## 12. Méthode par lots

Un lot = indépendamment testable : à la fin, l'app fonctionne, se déploie, la checklist s'exécute sans attendre le suivant. **Aucun lot sans GO explicite ; un seul push à la fin** (un push sur `main` = déploiement prod automatique : ne pas déployer une app à moitié migrée).

| Run | Contenu | Arrêt 🛑 |
|---|---|---|
| 0 | Fondations : tokens (typo, statuts, fond, rayon, mobile), composants `kv`, `check:design` en avertissement | 🛑 app **inchangée sauf** fond gris, angles, rien ne casse |
| 1 | Coque : sidebar suit le thème, logo 2 variantes, `PageHeader`, padding de page | 🛑 clair/sombre, logo net, nav active, mobile |
| 2 | Page publique de paiement (SC, états, réassurance) | 🛑 375 px, parcours complet 3G simulée |
| 3 | Dashboard : un chiffre dominant, une action primaire, découpage en `_components` | 🛑 1280 sans débordement, état compte neuf |
| 4 | `DataTable` : factures et clients, cartes < 640 px | 🛑 noms longs, tri/filtres identiques à avant |
| 5 | `ActionBar` + fiches latérales (matrice statut → primaire **validée avant**) | 🛑 chaque statut, aucune action perdue |
| 6 | Écrans restants (relances, paramètres, tarifs) ; `check:design --strict` | 🛑 formulaires denses, zéro violation |
| 7 | États : vide / chargement (squelette aux dimensions exactes) / erreur | 🛑 aucun saut de mise en page au rechargement |
| 8 | Perf : Server Components sur les listes (**risque élevé**, seul, après stabilisation) | 🛑 `build` de référence + poids de routes avant/après + tests RLS |

**Règles communes** : `npx tsc --noEmit` à chaque fin de lot (pas de `next build`, pas de `rm .next` serveur dev actif) ; un commit par lot (ou par écran pour les gros) ; libellés dans **les deux** fichiers de messages (FR + EN), un libellé en dur est un défaut bloquant ; aucun lot n'ajoute de dépendance client ; checklist visuelle passée **par le fondateur** sur **1280 + 375 px, FR + EN, clair + sombre** (4 combinaisons minimum par écran touché) — l'agent donne la checklist à chaque frontière de run, il ne la passe pas à sa place, et ne lance pas de vérif visuelle MCP sans accord. Arrêt possible après n'importe quel lot ; **les lots 0-3 suffisent** à changer la perception du produit.

**Format de session recommandé** : (1) session Opus dédiée, sans code : audit + spec + plan ; (2) implémentation par lots ; (3) arrêts de vérification ; (4) push unique ; (5) `check:design` pour mesurer la dette.

## 13. Écarts constatés spec ↔ code (2026-10-05)

| # | Sujet | La spec / l'ancien résumé dit | Le code fait | Source de vérité à retenir |
|---|---|---|---|---|
| 1 | Titre de page | `DESIGN_SYSTEM.md` §3.6 : `text-kv-title` (18 px) | `PageHeader` : `font-display text-2xl font-semibold` (Fraunces ~24 px). `text-kv-title` n'a que 4 usages, aucun titre d'écran | Code (serif display) ; `kv-title` = titre « fonctionnel » secondaire |
| 2 | Wordmark | Spec : Geist 520 | Wordmark serif Fraunces **converti en tracés** (historique : `9e2a231` Geist → `8ac0725` retour au serif d'origine → `337d852` Fraunces) | Code |
| 3 | `ActionBar` | Spec : `menu[]`, « une primaire, deux secondaires max, le reste dans `…` » | API `primary / secondary[] / destructive / menuLabel` ; tous les secondaires visibles, seul le destructif en menu (décision fondateur) | Code |
| 4 | `DataTable` | En-tête `sticky top-0` ; API `priority` | Pas de `sticky top-0` (seulement colonne gauche collée) ; en plus : `select`, `rowAccent`, `actions`, `mobileCard` | Code |
| 5 | `Counter` | Ancien résumé : « 0,4 s, une fois » ; plan : le supprimer | 900 ms, une fois, `prefers-reduced-motion` respecté, **toujours présent** (hero + KPI) | Code ; décision de le garder à confirmer |
| 6 | Défauts shadcn | Boutons / champs 32 px desktop, 44 mobile, `rounded-md`, tokens kv | `Button` / `Input` : `h-8` fixe, `text-sm`, `rounded-lg` | Code ; poser les classes à l'usage |
| 7 | `StateBlock` | §3.7 : remplace et réaligne `EmptyState` | `StateBlock` **défini mais jamais importé** ; `EmptyState.tsx` (ancien : `style={{}}` + dégradé, `text-sm`, `py-14`) toujours utilisé dans dashboard, clients, factures, relances | Dette : migrer ou supprimer l'un des deux |
| 8 | Page de paiement | 7 états, opérateurs nommés (MTN MoMo / Orange Money), reçu téléchargeable, carte 400 px | 2 états serveur (invalide, déjà payée) + 4 états client ; canaux « Mobile Money » / « Carte bancaire » **sans nom d'opérateur** ; pas de reçu téléchargeable (référence + date côté client) ; `text-base` / `h-12` en dur (`app/pay` exclu du check) | Code |
| 9 | Seuil et taille tactiles | Contrôles mobiles < 768 px, cibles ≥ 44 px | `controlBase`, `Segmented`, sidebar : bascule à `md` (768) ; `ActionBar` : à `sm` (640) ; `Segmented` fait 36 px de haut sur mobile (`h-9`) | À harmoniser |
| 10 | Couleur de chrome PWA | — | `themeColor` et `background_color` = navy fixe, commentaire « sidebar toujours sombre, indépendant du thème » devenu faux | À trancher : conserver ou suivre le thème |
| 11 | `check-design` | Exceptions déclarées en tête de fichier, bloquant en CI | Pas de mécanisme d'exception ; non bloquant ; `app/pay` et landing ignorés | Code |
| 12 | Pastilles de plan | « Jamais de pastille écrite à la main » | `PLAN_COLOR` (4 jeux de couleurs) dans la sidebar ; contraste « Starter » corrigé via `--primary-text` | Dette de structure restante (pas de ton `info` dans `StatusBadge`) |
| 13 | Conformité WCAG AA | `PROJECT_STATUS.md` : « conforme WCAG AA » | 2 des 3 couples corrigés le 2026-10-05 (`--primary-text`), le 3e (badge rouge) a disparu ; aucun test automatisé | Mesures du §9 |
| 14 | Graisses | Spec : 450 / 520 / 600 / 700 | Code définit aussi `extrabold` = 650 | Code |
| 15 | Police d'affichage | Spec ne la mentionne pas | Fraunces (~35 Ko, 500-700, `next/font/local`) sur wordmark + titres de page | Code |
| 16 | Règle de copy « jamais Orange » | Ancien résumé : « jamais « Orange » » à propos des opérateurs de paiement (confusion OCM / OM) | `messages/*.json` citent « Orange Money » et « MTN MoMo » (landing, tarifs, FAQ, CGU) : **correct**. La page de paiement, elle, n'en nomme aucun (« Mobile Money ») : amélioration possible | **Tranché 2026-10-05** : OCM interdit, OM / MoMo nommés (`../global.md`, `themes/koverit.md` §6) |
| 17 | `Field` | — | Ne pose pas `aria-invalid` sur le champ | À faire côté `Input` |

## 14. Hors périmètre

Graphiques (aucune dataviz au-delà des barres de progression), emails transactionnels (`lib/resend/`, tokens non partagés), PDF de facture (`InvoicePreview.tsx`, registre distinct, 39 écarts `check:design` assumés), mode sombre de la landing, `CopilotDrawer` (suit les tokens, pas de refonte propre).

---

## 15. Démarrer un nouveau SaaS ou un projet client

**Nouveau SaaS du portfolio** (clone du template, voir `saas-architecture.md` / `saas-factory-rules.md` pour l'infra, `saas_id`, variables d'environnement) :

| Étape | Action | Vérif |
|---|---|---|
| 1 | Copier `themes/_template.md` → `themes/<produit>.md`, le remplir **avant** de coder (accent, `H`, fonts, logo, copy) | Section « Contrôles » du thème remplie |
| 2 | Copier la couche design du template : `app/globals.css` (blocs typo / statuts / mobile / neutres), `components/kv/*`, `lib/utils.ts` (`cn` étendu), `scripts/check-design.mjs`, `app/fonts/<police-affichage>.woff2` + branchement `next/font/local` dans `app/layout.tsx`, `app/manifest.ts`, `public/sw.js`, `components/pwa-register.tsx` | `npx tsc --noEmit` |
| 3 | Remplacer les **valeurs** par celles du thème : `--primary` (clair + sombre), `H` des neutres, hex sémantiques, polices | Calcul des contrastes (§9) — tableau rempli dans le thème |
| 4 | Logo : monogramme + wordmark converti en tracés, **2 variantes** (clair / sombre), favicon, icônes PWA 192/512/maskable, `og-image` | Net à 216 px de large, dans les deux thèmes |
| 5 | PWA : `name`, `short_name`, `theme_color`, `background_color`, `lang` | Installable sur mobile |
| 6 | `npm run check:design` : **cloner Koverit embarque ses écarts hérités** (135 / 9 / 79, surtout admin, Copilot, onboarding, auth, PDF). Relever la baseline, supprimer ou migrer ce qui ne sert pas au nouveau produit, puis passer en **`--strict` dans la CI** (contrairement à Koverit, jamais fait) | Compteur à 0 sur le périmètre gardé, CI verte |
| 7 | Premier écran réel selon la méthode (§12) : Run 0 → 🛑 → Run 1 → 🛑 | Checklist 1280 + 375, FR + EN, clair + sombre |

**Projet client** (marque du client, pas de couplage portfolio) : même couche design, un thème dédié `themes/client-<nom>.md`. Différences à décider explicitement avec le fondateur avant de commencer : propriété et licence du wordmark / police d'affichage (un fichier de police tiers n'est pas librement redistribuable), registre de la landing, langues, exigences d'accessibilité contractuelles (le §9 est un plancher, pas un engagement), et si le client a déjà un guide de marque (il prime sur le thème « Factory », le core reste inchangé). Ne pas reprendre le copy ni les règles de mention d'un autre produit.

**Escalade** : un travail de design system / prototypage visuel pur se propose en bascule vers Claude Design ou un chat Opus (voir `claude-code-workflow.md`) ; Claude Code implémente.
