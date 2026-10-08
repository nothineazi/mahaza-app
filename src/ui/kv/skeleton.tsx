import * as React from "react";
import { cn } from "@/core/lib/utils";

/** Bloc de chargement : donner les dimensions exactes du contenu final (aucun saut de mise en page). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("lux-skeleton rounded-md bg-muted", className)} />;
}

/** Zone de chargement annoncée une seule fois aux lecteurs d'écran. */
export function LoadingRegion({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
