import * as React from "react";
import type { BookingStatus } from "@/core/types";
import { STATUS_LABELS } from "@/core/booking/status";
import { cn } from "@/core/lib/utils";

/**
 * Tons du badge : les cinq statuts de réservation + deux tons génériques (ADR-037).
 * Correspondance statut → jeton : pending_deposit = ambre · confirmed = vert · completed = teinte de marque (info) ·
 * cancelled = neutre · no_show = rouge.
 */
export type StatusTone = BookingStatus | "success" | "neutral";

const BADGE: Record<StatusTone, string> = {
  pending_deposit: "bg-status-pending-bg text-status-pending-fg",
  confirmed: "bg-status-confirmed-bg text-status-confirmed-fg",
  completed: "bg-status-completed-bg text-status-completed-fg",
  cancelled: "bg-status-cancelled-bg text-status-cancelled-fg",
  no_show: "bg-status-noshow-bg text-status-noshow-fg",
  success: "bg-status-confirmed-bg text-status-confirmed-fg",
  neutral: "bg-status-cancelled-bg text-status-cancelled-fg",
};

/** Bloc du planning : fond du statut et liseré gauche de la couleur du statut. */
export const STATUS_BLOCK: Record<BookingStatus, string> = {
  pending_deposit: "border-status-pending-fg bg-status-pending-bg",
  confirmed: "border-status-confirmed-fg bg-status-confirmed-bg",
  completed: "border-status-completed-fg bg-status-completed-bg",
  cancelled: "border-status-cancelled-fg bg-status-cancelled-bg",
  no_show: "border-status-noshow-fg bg-status-noshow-bg",
};

/** Pastille de légende (même couleur que le liseré du bloc). */
export const STATUS_DOT: Record<BookingStatus, string> = {
  pending_deposit: "bg-status-pending-fg",
  confirmed: "bg-status-confirmed-fg",
  completed: "bg-status-completed-fg",
  cancelled: "bg-status-cancelled-fg",
  no_show: "bg-status-noshow-fg",
};

/** Un seul composant pour tous les statuts. Le sens est toujours porté par le texte, jamais par la couleur seule. */
export function StatusBadge({ tone, className, children }: { tone: StatusTone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex h-5 items-center whitespace-nowrap rounded-full px-2 text-kv-label normal-case tracking-normal", BADGE[tone], className)}>
      {children}
    </span>
  );
}

/** Badge d'un statut de réservation, libellé en toutes lettres. */
export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <StatusBadge tone={status} className={className}>
      {STATUS_LABELS[status]}
    </StatusBadge>
  );
}
