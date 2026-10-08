/**
 * Chaînes de classes partagées des contrôles du back-office (docs/reference/factory-core.md §4 et §5.8).
 * Le tactile 44 px ne s'applique qu'au mobile (`h-11 md:h-8`) : l'imposer au bureau donne un rendu « zoomé ».
 * Les primitives du site public (src/ui/primitives) ont une autre forme (pilule, 48 px) : on ne s'en sert pas ici.
 */

export const focusRing =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Socle d'un bouton : 44 px sur mobile, 32 px sur bureau, libellé en graisse 520. */
export const controlBase = `inline-flex h-11 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-kv-body font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 md:h-8 [&_svg]:size-4 [&_svg]:shrink-0 ${focusRing}`;

/** Action primaire de l'écran (une seule par écran) : 36 px sur bureau. */
export const controlPrimary = `${controlBase} bg-primary text-primary-foreground hover:bg-primary/90 md:h-9`;

/** Action secondaire : contour, fond de carte. */
export const controlSecondary = `${controlBase} border border-input bg-card text-foreground hover:bg-muted`;

/** Action discrète (barre d'outils, retour). */
export const controlGhost = `${controlBase} text-foreground hover:bg-muted`;

/** Action destructive (toujours confirmée ou placée dans un menu). */
export const controlDanger = `${controlBase} border border-destructive bg-card text-destructive hover:bg-danger-bg`;

/** Bouton icône seule (44 × 44 sur mobile, 32 × 32 sur bureau). */
export const controlIcon = `${controlSecondary} w-11 px-0 md:w-8`;

/** Champ : 44 px et police 16 px sur mobile (évite le zoom d'iOS), 32 px et corps 13 px sur bureau. */
export const fieldControl = `block h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground transition-colors disabled:opacity-50 aria-invalid:border-destructive md:h-8 md:text-kv-body ${focusRing}`;

/** Zone de texte : même habillage, hauteur libre. */
export const textareaControl = `${fieldControl} h-auto min-h-24 py-2 md:h-auto`;

/** Filtre à bascule (`aria-pressed`) : contour au repos, plein quand il est actif. */
export const controlChip = `${controlSecondary} aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary/90`;

/** Action WhatsApp (ouvre un message pré-rempli) : vert « succès ». */
export const controlSuccess = `${controlBase} bg-success text-success-foreground hover:bg-success/90`;
