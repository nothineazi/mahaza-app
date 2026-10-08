"use client";

import type { ReactNode } from "react";
import { LazyOnVisible } from "@/ui/lazy-on-visible";

// L'import dynamique vit dans ce module client : une fonction ne peut pas être passée d'un composant serveur à un composant client.
const loadStudio = () => import("@/ui/home/gift-card-studio").then((m) => m.GiftCardStudio);

/** Charge le studio de cartes cadeaux quand la section approche de l'écran. */
export function LazyGiftCardStudio({ fallback }: { fallback: ReactNode }) {
  return <LazyOnVisible load={loadStudio} fallback={fallback} />;
}
