import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Échelle typographique kv (src/ui/kv/kv.css). Sans cette extension, tailwind-merge prend `text-kv-body` pour une couleur
 * et supprime `text-muted-foreground` (ou l'inverse).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["kv-display", "kv-title", "kv-section", "kv-body", "kv-meta", "kv-label"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 15000 -> "15 000 FCFA" (formatage maison : identique serveur/navigateur). */
export function formatPrice(amount: number): string {
  const digits = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${digits} FCFA`;
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m.toString().padStart(2, "0")}`;
}
