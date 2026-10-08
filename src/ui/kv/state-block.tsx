import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/core/lib/utils";

/**
 * Gabarit commun des états vide et erreur. Une erreur dit ce qui s'est passé ET quoi faire (`action`).
 * Chargement : squelette aux dimensions exactes du contenu (voir `Skeleton`), pas un spinner.
 */
export function StateBlock({ icon: Icon, title, text, action, tone = "neutral", className }: { icon: LucideIcon; title: React.ReactNode; text?: React.ReactNode; action?: React.ReactNode; tone?: "neutral" | "error"; className?: string }) {
  return (
    <div role={tone === "error" ? "alert" : undefined} className={cn("flex flex-col items-center gap-2 px-4 py-10 text-center", className)}>
      <span className={cn("flex size-10 items-center justify-center rounded-lg", tone === "error" ? "bg-danger-bg text-destructive" : "bg-muted text-muted-foreground")}>
        <Icon className="size-5" aria-hidden />
      </span>
      <p className="text-kv-section">{title}</p>
      {text && <p className="max-w-md text-kv-meta text-muted-foreground">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
