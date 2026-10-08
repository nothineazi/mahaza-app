import { Pill } from "@/components/mahaza/ui/pill";

/** Marque une donnée de démo inventée (praticien, salle, réservation seed…). */
export function FictiveBadge({ className }: { className?: string }) {
  return (
    <Pill tone="neutral" className={className} title="Donnée fictive de démonstration">
      FICTIF
    </Pill>
  );
}
