import * as React from "react";
import { cn } from "@/core/lib/utils";

/** Panneau : un sujet, une bordure, pas d'ombre. */
export function Panel({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("min-w-0 rounded-lg border bg-card p-4 text-card-foreground", className)} {...props} />;
}

/** En-tête de panneau : titre (tronqué) et action éventuelle à droite. */
export function PanelHeader({ title, action, className, as: Tag = "h2" }: { title: React.ReactNode; action?: React.ReactNode; className?: string; as?: "h2" | "h3" }) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-2", className)}>
      <Tag className="min-w-0 truncate text-kv-section">{title}</Tag>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
