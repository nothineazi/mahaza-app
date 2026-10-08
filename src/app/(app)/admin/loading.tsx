import { LoadingRegion, Skeleton } from "@/ui/kv/skeleton";

/** Chargement d'une page du back-office (navigation) : squelette aux dimensions de l'en-tête et du contenu. */
export default function AdminLoading() {
  return (
    <LoadingRegion label="Chargement de la page" className="space-y-6">
      <Skeleton className="h-[52px] w-64" />
      <Skeleton className="h-[320px]" />
    </LoadingRegion>
  );
}
