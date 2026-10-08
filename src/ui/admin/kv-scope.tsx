"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/core/lib/utils";

/**
 * Zone du registre « back-office » (src/ui/kv/kv.css). La classe est posée sur le conteneur (rendu serveur, sans clignotement)
 * et sur <body> tant que le back-office est affiché, pour que les dialogues rendus hors de la coque (portail Radix) aient le même registre.
 */
export function KvScope({ className, children }: { className?: string; children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add("kv-app");
    return () => document.body.classList.remove("kv-app");
  }, []);
  return <div className={cn("kv-app", className)}>{children}</div>;
}
