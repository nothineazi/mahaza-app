import { cn } from "@/core/lib/utils";

export { LoadingRegion } from "@/ui/primitives/skeleton";

/** Bloc de chargement : donner les dimensions exactes du contenu final (aucun saut de mise en page). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("lux-skeleton rounded-md bg-muted", className)} />;
}
