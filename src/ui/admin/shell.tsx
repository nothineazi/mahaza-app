import type { ReactNode } from "react";
import { KvScope } from "@/ui/admin/kv-scope";
import { MobileHeader, Sidebar } from "@/ui/admin/sidebar";

/** Coque du back-office (factory §5.9) : barre latérale de 216 px (≥ md), en-tête et tiroir sous md, contenu en `p-4 md:p-5`. */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <KvScope className="min-h-dvh bg-background md:flex">
      <a href="#contenu-admin" className="sr-only z-60 rounded-md bg-primary px-3 py-2 text-kv-body font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Aller au contenu
      </a>
      <Sidebar />
      <div className="min-w-0 flex-1">
        <MobileHeader />
        <main id="contenu-admin" tabIndex={-1} className="kv-content-fade mx-auto max-w-7xl space-y-6 p-4 outline-hidden md:p-5">
          <p className="rounded-lg border bg-card px-3 py-2 text-kv-meta text-muted-foreground">
            Démonstration sans authentification. Les modifications sont conservées dans cet onglet du navigateur (elles ne vont nulle part ailleurs) ; « Réinitialiser la démo » (menu) revient aux données de départ. Données de démonstration marquées <strong className="font-semibold text-foreground">FICTIF</strong>.
          </p>
          {children}
        </main>
      </div>
    </KvScope>
  );
}
