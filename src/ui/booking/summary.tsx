"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronUp, Info, Trash2 } from "lucide-react";
import { brand } from "@/brand/brand.config";
import type { ReservationLine } from "@/core/types";
import { cartDurationLabel } from "@/core/booking/cart";
import { endTime, formatDateLong } from "@/core/lib/dates";
import { getSite, multiSite } from "@/core/sites/sites";
import { depositForService } from "@/core/booking/availability";
import { formatPrice } from "@/core/lib/utils";
import { Button } from "@/ui/primitives/button";
import { Card } from "@/ui/primitives/card";
import type { Draft } from "@/ui/booking/types";

export interface PrimaryAction {
  label: string;
  disabled?: boolean;
  /** Bouton « submit » d'un formulaire (id) plutôt qu'un clic. */
  form?: string;
  onClick?: () => void;
  hint?: string;
}

export interface SummaryProps {
  draft: Draft;
  lines: ReservationLine[] | null;
  onRemove?: (serviceId: string) => void;
}
type Props = SummaryProps;

const loadSheet = () => import("@/ui/booking/summary-sheet").then((m) => m.SummarySheet);
const SummarySheet = dynamic(loadSheet);


/** Contenu du récapitulatif : site, soins du panier, créneau, acompte. Aucun prix de soin (inconnus). */
export function SummaryBody({ draft, lines, onRemove }: Props) {
  const site = draft.siteId ? getSite(draft.siteId) : null;
  const services = draft.cart.map((id) => brand.services.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const total = cartDurationLabel(services);
  const deposit = site ? depositForService({}, site) : null;

  return (
    <div className="space-y-5 text-sm">
      {multiSite && site && (
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Site</p>
          <p className="mt-1 font-medium">{site.name}</p>
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Vos soins</p>
        {services.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-line p-4 text-muted-foreground">Votre panier est vide. Ajoutez un ou plusieurs soins.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {services.map((s, i) => {
              const line = lines?.[i];
              const practitioner = draft.choice[s.id];
              return (
                <li key={s.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                  <div className="min-w-0">
                    <p className="font-medium leading-snug">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {line ? `${line.start} – ${endTime(line.start, line.durationMin)}${s.durationMin == null ? " (indicatif)" : ""}` : practitioner ? "Praticien choisi" : "Sans préférence de praticien"}
                    </p>
                  </div>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(s.id)}
                      className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Trash2 className="size-4" aria-hidden />
                      <span className="sr-only">Retirer {s.name}</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {total && <p className="mt-2 font-medium">Durée totale : {total}</p>}
        {services.length > 0 && !total && (
          <p className="mt-2 flex gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Durées des soins à confirmer par {brand.name} : créneaux indicatifs de {brand.defaultDurationMin} min par soin (FICTIF).
          </p>
        )}
      </div>

      {draft.date && draft.time && (
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Créneau</p>
          <p className="mt-1 font-medium first-letter:uppercase">{formatDateLong(draft.date)}</p>
          <p className="text-muted-foreground">
            Début à {draft.time}
            {lines && lines.length > 0 && ` · fin vers ${endTime(lines[lines.length - 1].start, lines[lines.length - 1].durationMin)}`}
          </p>
        </div>
      )}

      {deposit != null && services.length > 0 && (
        <div className="flex items-baseline justify-between rounded-xl bg-secondary px-4 py-3 text-secondary-foreground">
          <span>Acompte (FICTIF)</span>
          <span className="font-display text-xl font-medium">{formatPrice(deposit)}</span>
        </div>
      )}
    </div>
  );
}

/** Colonne latérale (≥ lg) : récapitulatif persistant + action principale. */
export function SummaryPanel({ draft, lines, action, onRemove }: Props & { action: PrimaryAction | null }) {
  return (
    <aside aria-label="Récapitulatif de votre réservation" className="hidden lg:block">
      <Card className="sticky top-24 space-y-6 p-6">
        <h2 className="font-display text-2xl font-medium">Votre réservation</h2>
        <SummaryBody draft={draft} lines={lines} onRemove={onRemove} />
        {action && <ActionButton action={action} />}
      </Card>
    </aside>
  );
}

function ActionButton({ action, className }: { action: PrimaryAction; className?: string }) {
  return (
    <div className="space-y-2">
      <Button
        size="lg"
        className={className ?? "w-full"}
        disabled={action.disabled}
        {...(action.form ? { type: "submit" as const, form: action.form } : { onClick: action.onClick })}
      >
        {action.label}
      </Button>
      {action.hint && action.disabled && <p className="text-center text-xs text-muted-foreground">{action.hint}</p>}
    </div>
  );
}

/** Barre fixe (< lg) : résumé compact, feuille du panier détaillé et action principale. */
export function SummaryBar({ draft, lines, action, onRemove }: Props & { action: PrimaryAction | null }) {
  const [open, setOpen] = useState(false);
  // Le dialogue n'est monté (et son code téléchargé) qu'à la première ouverture ; on le précharge au repos du navigateur.
  const [everOpened, setEverOpened] = useState(false);
  useEffect(() => {
    const id = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(() => void loadSheet(), { timeout: 4000 }) : window.setTimeout(() => void loadSheet(), 2000);
    return () => (typeof window.cancelIdleCallback === "function" ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, []);
  const count = draft.cart.length;
  const site = draft.siteId ? getSite(draft.siteId) : null;
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-lift backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setEverOpened(true);
            }}
            aria-haspopup="dialog"
            className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">
                {count === 0 ? "Panier vide" : `${count} soin${count > 1 ? "s" : ""}`}
                {multiSite && site ? ` · ${site.name}` : ""}
              </span>
              <span className="block text-xs text-muted-foreground">Voir le récapitulatif</span>
            </span>
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
          {action && (
            <Button
              size="md"
              className="shrink-0"
              disabled={action.disabled}
              {...(action.form ? { type: "submit" as const, form: action.form } : { onClick: action.onClick })}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
      {everOpened && <SummarySheet open={open} onOpenChange={setOpen} draft={draft} lines={lines} onRemove={onRemove} />}
    </>
  );
}
