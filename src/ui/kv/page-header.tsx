import * as React from "react";
import { cn } from "@/core/lib/utils";

/**
 * En-tête d'écran : titre en police d'affichage, sous-titre, une seule action primaire.
 * Ne pas passer de marge basse dans `className` : elle écraserait l'espace sous l'en-tête.
 */
export function PageHeader({ title, subtitle, action, className }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-2", className)}>
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-kv-meta text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
    </header>
  );
}
