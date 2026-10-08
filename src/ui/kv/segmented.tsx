"use client";

import { cn } from "@/core/lib/utils";
import { focusRing } from "@/ui/kv/control-classes";

/** Filtre à choix unique (période, type de vue, groupement) : bloc discret, pouce actif `bg-card`. */
export function Segmented<T extends string>({ options, value, onChange, label, className }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex max-w-full gap-0.5 overflow-x-auto rounded-md bg-muted p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 shrink-0 whitespace-nowrap rounded-sm px-3 text-kv-body font-semibold transition-colors md:h-7",
            focusRing,
            value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
