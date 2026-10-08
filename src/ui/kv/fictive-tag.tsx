import { StatusBadge } from "@/ui/kv/status-badge";

/** Marque une donnée de démonstration inventée (praticien, salle, réservation seed, KPI…). Version back-office du badge « FICTIF ». */
export function FictiveTag({ className }: { className?: string }) {
  return (
    <span title="Donnée fictive de démonstration" className={className}>
      <StatusBadge tone="neutral">FICTIF</StatusBadge>
    </span>
  );
}
