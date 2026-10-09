"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useAppStore } from "@/core/state/store";
import { controlDanger, controlGhost, controlSecondary } from "@/ui/kv/control-classes";

/**
 * « Réinitialiser la démo » : efface l'état conservé dans le navigateur (ADR-041) et repart des données seed. Demande une confirmation
 * (l'action fait perdre les réservations créées pendant la présentation).
 */
export function ResetDemoButton({ onDone }: { onDone?: () => void }) {
  const { resetDemo } = useAppStore();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={controlSecondary + " w-full justify-start"}>
        <RotateCcw aria-hidden /> Réinitialiser la démo
      </button>
    );
  }
  return (
    <div role="alert" className="space-y-2 rounded-lg border border-destructive bg-danger-bg p-2 text-kv-meta text-destructive">
      <p>Effacer les réservations et modifications faites dans ce navigateur, et revenir aux données de départ ?</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            resetDemo();
            setConfirming(false);
            onDone?.();
          }}
          className={controlDanger}
        >
          Réinitialiser
        </button>
        <button type="button" onClick={() => setConfirming(false)} className={controlGhost}>
          Annuler
        </button>
      </div>
    </div>
  );
}
