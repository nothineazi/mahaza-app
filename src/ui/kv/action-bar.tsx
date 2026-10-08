"use client";

import * as React from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { controlDanger, controlIcon, controlPrimary, controlSecondary, controlSuccess } from "@/ui/kv/control-classes";

/**
 * Une action de la barre. `onClick` ; ou `href` (lien externe : s'ouvre dans un nouvel onglet) ; ou `submitForm` (id d'un
 * formulaire à soumettre : l'action devient un bouton `submit` lié au formulaire, même hors de celui-ci).
 */
export type BarAction = {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  submitForm?: string;
  disabled?: boolean;
  /** Identifiant du texte qui explique pourquoi l'action est indisponible. */
  describedBy?: string;
  /** `success` : action WhatsApp. */
  tone?: "default" | "success";
};

function ActionButton({ action, className }: { action: BarAction; className: string }) {
  const content = (
    <>
      {action.icon && <action.icon aria-hidden />}
      {action.label}
    </>
  );
  if (action.href) {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" onClick={action.onClick} className={className}>
        {content}
      </a>
    );
  }
  return (
    <button type={action.submitForm ? "submit" : "button"} form={action.submitForm} onClick={action.onClick} disabled={action.disabled} aria-describedby={action.describedBy} className={className}>
      {content}
    </button>
  );
}

/**
 * Barre d'actions collée en bas d'une fiche ou d'un formulaire.
 * UNE action primaire (adaptée au statut), toutes les autres actions restent visibles en secondaire ; seule l'action
 * destructive va dans un menu « … » (ouvert vers le haut). Primaire pleine largeur sur mobile.
 * `menuLabel` : nom accessible du menu (« Autres actions » par défaut).
 */
export function ActionBar({ primary, secondary = [], destructive, menuLabel = "Autres actions", className }: { primary?: BarAction; secondary?: BarAction[]; destructive?: BarAction; menuLabel?: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-t bg-popover p-3", className)}>
      {primary && <ActionButton action={primary} className={cn(controlPrimary, "w-full sm:w-auto")} />}
      {secondary.map((a) => (
        <ActionButton key={a.label} action={a} className={cn(a.tone === "success" ? controlSuccess : controlSecondary, "max-sm:flex-1")} />
      ))}
      {destructive && <DestructiveMenu action={destructive} menuLabel={menuLabel} />}
    </div>
  );
}

function DestructiveMenu({ action, menuLabel }: { action: BarAction; menuLabel: string }) {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLDivElement>(null);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const item = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    item.current?.focus();
    const close = (restoreFocus: boolean) => {
      setOpen(false);
      if (restoreFocus) trigger.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Le menu referme d'abord : Échap ne doit pas fermer aussi la fiche qui le contient.
        e.stopPropagation();
        close(true);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div ref={root} className="relative ml-auto">
      <button ref={trigger} type="button" aria-label={menuLabel} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={controlIcon}>
        <MoreHorizontal aria-hidden />
      </button>
      {open && (
        <div role="menu" aria-label={menuLabel} className="absolute bottom-full right-0 z-20 mb-1 min-w-52 rounded-lg border bg-popover p-1 shadow-md">
          <button
            ref={item}
            type="button"
            role="menuitem"
            disabled={action.disabled}
            onClick={() => {
              setOpen(false);
              action.onClick?.();
            }}
            className={cn(controlDanger, "w-full justify-start border-0 bg-transparent")}
          >
            {action.icon && <action.icon aria-hidden />}
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
