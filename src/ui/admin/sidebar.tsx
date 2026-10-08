"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ExternalLink, Menu, X } from "lucide-react";
import { BrandLogo } from "@/ui/brand-logo";
import { AdminNav } from "@/ui/admin/nav";
import { AdminSiteSelector } from "@/ui/admin/site-selector";
import { StatusBadge } from "@/ui/kv/status-badge";
import { ThemeToggle } from "@/ui/kv/theme-toggle";
import { controlIcon, controlSecondary } from "@/ui/kv/control-classes";

/** Contenu de la coque (barre latérale ≥ md, tiroir sous md) : logo, site, navigation, thème. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        <BrandLogo compact />
        <StatusBadge tone="neutral">Back-office · démo</StatusBadge>
      </div>
      <AdminSiteSelector />
      <div className="flex-1">
        <AdminNav onNavigate={onNavigate} />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-sidebar-border pt-3">
        <Link href="/" className={`${controlSecondary} min-w-0 flex-1 justify-start`}>
          Voir le site <ExternalLink aria-hidden />
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}

/** Barre latérale de 216 px, visible dès `md`. Elle suit le thème (jetons `sidebar-*`). */
export function Sidebar() {
  return (
    <aside className="hidden w-54 shrink-0 border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground md:sticky md:top-0 md:block md:h-dvh md:overflow-y-auto">
      <SidebarContent />
    </aside>
  );
}

/** En-tête mobile (< md) et tiroir de navigation : piège de focus et Échap gérés par Radix. */
export function MobileHeader() {
  const [open, setOpen] = useState(false);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-sidebar-border bg-sidebar px-3 md:hidden">
        <DialogPrimitive.Trigger className={controlIcon} aria-label="Ouvrir le menu du back-office">
          <Menu aria-hidden />
        </DialogPrimitive.Trigger>
        <BrandLogo compact />
        <ThemeToggle />
      </header>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-inverse/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] overflow-y-auto border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left md:hidden"
        >
          <DialogPrimitive.Title className="sr-only">Menu du back-office</DialogPrimitive.Title>
          <DialogPrimitive.Close className={`${controlIcon} absolute right-2 top-2`} aria-label="Fermer le menu">
            <X aria-hidden />
          </DialogPrimitive.Close>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
