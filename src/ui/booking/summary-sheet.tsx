"use client";

import { Button } from "@/ui/primitives/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/ui/primitives/dialog";
import { SummaryBody, type SummaryProps } from "@/ui/booking/summary";

/** Feuille du récapitulatif détaillé (mobile). Chargée à la demande depuis `SummaryBar` : le dialogue Radix n'est pas dans le First Load JS. */
export function SummarySheet({ open, onOpenChange, draft, lines, onRemove }: SummaryProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="sheet">
        <DialogHeader>
          <DialogTitle>Votre réservation</DialogTitle>
          <DialogDescription>Récapitulatif de vos choix.</DialogDescription>
        </DialogHeader>
        <SummaryBody draft={draft} lines={lines} onRemove={onRemove} />
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Fermer
        </Button>
      </DialogContent>
    </Dialog>
  );
}
