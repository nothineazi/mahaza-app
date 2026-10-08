"use client";

import * as React from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { controlDanger, controlIcon, controlPrimary, controlSecondary } from "@/ui/kv/control-classes";

export type BarAction = { label: string; icon?: LucideIcon; onClick: () => void; disabled?: boolean };

/**
 * Barre d'actions collée en bas d'une fiche ou d'un formulaire.
 * UNE action primaire (adaptée au statut), toutes les autres actions restent visibles en secondaire ; seule l'action
 * destructive va dans un menu « … » (ouvert vers le haut). Primaire pleine largeur sur mobile.
 * `menuLabel` est obligatoire (nom accessible du menu), même sans action destructive : passer `""`.
 */
export function ActionBar({ primary, secondary = [], destructive, menuLabel, className }: { primary?: BarAction; secondary?: BarAction[]; destructive?: BarAction; menuLabel: string; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-t bg-popover p-3", className)}>
      {primary && (
        <button type="button" onClick={primary.onClick} disabled={primary.disabled} className={cn(controlPrimary, "w-full sm:w-auto")}>
          {primary.icon && <primary.icon aria-hidden />}
          {primary.label}
        </button>
      )}
      {secondary.map((a) => (
        <button key={a.label} type="button" onClick={a.onClick} disabled={a.disabled} className={cn(controlSecondary, "max-sm:flex-1")}>
          {a.icon && <a.icon aria-hidden />}
          {a.label}
        </button>
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
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative ml-auto">
      <button ref={trigger} type="button" aria-label={menuLabel} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={controlIcon}>
        <MoreHorizontal aria-hidden />
      </button>
      {open && (
        <div role="menu" aria-label={menuLabel} className="absolute bottom-full right-0 z-20 mb-1 min-w-44 rounded-lg border bg-popover p-1 shadow-md">
          <button
            ref={item}
            type="button"
            role="menuitem"
            disabled={action.disabled}
            onClick={() => {
              setOpen(false);
              action.onClick();
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
