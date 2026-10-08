"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { controlIcon } from "@/ui/kv/control-classes";

export const Modal = DialogPrimitive.Root;

/**
 * Fiche modale du back-office : feuille ancrée en bas sur mobile, centrée dès `sm`, `rounded-xl`, bordure + ombre de surface flottante.
 * Structure : `ModalHeader` (titre) · `ModalBody` (défile) · pied (`ActionBar`). Piège de focus et Échap gérés par Radix.
 */
export const ModalContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { size?: "md" | "lg" }
>(({ className, children, size = "md", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-inverse/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "kv-app fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-hidden rounded-t-xl border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0",
        size === "lg" ? "sm:max-w-2xl" : "sm:max-w-lg",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
ModalContent.displayName = "ModalContent";

/** En-tête de fiche : titre (obligatoire pour les lecteurs d'écran), description optionnelle, bouton de fermeture. */
export function ModalHeader({ title, description, className }: { title: React.ReactNode; description?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-2 border-b p-4", className)}>
      <div className="min-w-0 space-y-1">
        <DialogPrimitive.Title className="text-kv-title">{title}</DialogPrimitive.Title>
        {description && (
          <DialogPrimitive.Description asChild>
            <div className="text-kv-meta text-muted-foreground">{description}</div>
          </DialogPrimitive.Description>
        )}
      </div>
      <DialogPrimitive.Close className={cn(controlIcon, "-mr-1 -mt-1 shrink-0 border-0 bg-transparent")} aria-label="Fermer">
        <X aria-hidden />
      </DialogPrimitive.Close>
    </div>
  );
}

/** Corps défilant de la fiche. */
export function ModalBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-0 flex-1 space-y-4 overflow-y-auto p-4", className)} {...props} />;
}
