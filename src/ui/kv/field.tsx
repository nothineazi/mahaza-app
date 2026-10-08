import * as React from "react";
import { cn } from "@/core/lib/utils";

/**
 * Champ de formulaire : libellé AU-DESSUS (jamais à gauche), aide, erreur.
 * L'erreur remplace l'aide. `Field` ne pose pas `aria-invalid` ni `aria-describedby` sur le champ : à faire sur le contrôle
 * avec `fieldIds(htmlFor)`.
 */
export function Field({ label, hint, error, required, htmlFor, className, children }: { label: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; required?: boolean; htmlFor?: string; className?: string; children: React.ReactNode }) {
  const ids = htmlFor ? fieldIds(htmlFor) : null;
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-kv-label uppercase text-muted-foreground">
        {label}
        {required && <span aria-hidden className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error ? (
        <p id={ids?.error} role="alert" className="text-kv-meta text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={ids?.hint} className="text-kv-meta text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Identifiants de l'aide et de l'erreur d'un champ (pour `aria-describedby`). */
export const fieldIds = (htmlFor: string) => ({ hint: `${htmlFor}-hint`, error: `${htmlFor}-error` });
