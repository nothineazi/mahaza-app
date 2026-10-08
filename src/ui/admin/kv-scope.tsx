import type { ReactNode } from "react";
import { cn } from "@/core/lib/utils";

/**
 * Zone du registre « back-office » (src/ui/kv/kv.css) : la coque. Les surfaces rendues hors de la coque par un portail Radix
 * (fiches `ModalContent`, tiroir mobile) portent elles-mêmes la classe `kv-app` : rendu serveur correct dès la première peinture.
 */
export function KvScope({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("kv-app", className)}>{children}</div>;
}
