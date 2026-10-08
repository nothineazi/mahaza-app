"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeft, Award, Search, UserRound, UserRoundX } from "lucide-react";
import { brand } from "@/brand/brand.config";
import type { Client, Reservation } from "@/core/types";
import { useAdminData } from "@/core/state/store";
import { loyaltyFor } from "@/core/clients/loyalty";
import { reservationEnd } from "@/core/booking/scheduling";
import { phoneKey } from "@/core/clients/phone";
import { formatDateShort } from "@/core/lib/dates";
import { norm } from "@/core/lib/text";
import { cn } from "@/core/lib/utils";
import { serviceNames } from "@/ui/admin/helpers";
import { ReservationDialog } from "@/ui/admin/reservation-dialog";
import { controlGhost, controlPrimary, fieldControl, focusRing, textareaControl } from "@/ui/kv/control-classes";
import { DataTable, type Column } from "@/ui/kv/data-table";
import { Field } from "@/ui/kv/field";
import { FictiveTag } from "@/ui/kv/fictive-tag";
import { PageHeader } from "@/ui/kv/page-header";
import { Panel, PanelHeader } from "@/ui/kv/panel";
import { LoadingRegion, Skeleton } from "@/ui/kv/skeleton";
import { StateBlock } from "@/ui/kv/state-block";
import { BookingStatusBadge, StatusBadge } from "@/ui/kv/status-badge";

const loyalty = (c: Client, history: Reservation[]) => loyaltyFor(c, history.map((r) => r.status), brand.policies.loyalty);

export function Clients() {
  const { ready, clients, reservations, focusClientId, setFocusClientId, site } = useAdminData();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(focusClientId);
  const searchId = useId();

  useEffect(() => {
    if (focusClientId) setFocusClientId(null);
  }, [focusClientId, setFocusClientId]);

  const byClient = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of reservations) {
      const list = map.get(r.clientId);
      if (list) list.push(r);
      else map.set(r.clientId, [r]);
    }
    return map;
  }, [reservations]);

  const rows = useMemo(() => {
    const q = norm(query.trim());
    const digits = q.replace(/\D/g, "");
    return clients
      .filter((c) => !q || norm(c.name).includes(q) || (digits.length >= 3 && phoneKey(c.phone).includes(digits)))
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [clients, query]);

  if (!ready) {
    return (
      <LoadingRegion label="Chargement des clients" className="space-y-6">
        <Skeleton className="h-[52px] w-48" />
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Skeleton className="h-[480px]" />
          <Skeleton className="h-[480px] max-lg:hidden" />
        </div>
      </LoadingRegion>
    );
  }

  const selected = clients.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" subtitle={site.name} />
      <div className="grid gap-4 lg:grid-cols-[340px_1fr] lg:items-start">
        <div className={cn("space-y-2", selected && "max-lg:hidden")}>
          <div className="relative">
            <label htmlFor={searchId} className="sr-only">Rechercher un client</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input id={searchId} type="search" className={cn(fieldControl, "pl-9")} placeholder="Nom ou téléphone" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <p aria-live="polite" className="text-kv-meta text-muted-foreground">
            {rows.length} client{rows.length > 1 ? "s" : ""} pour ce site
          </p>
          {rows.length === 0 ? (
            <Panel>
              <StateBlock
                icon={UserRoundX}
                title="Aucun client trouvé"
                text="Aucun client ne correspond à cette recherche."
                action={
                  query && (
                    <button type="button" onClick={() => setQuery("")} className={controlGhost}>
                      Effacer la recherche
                    </button>
                  )
                }
              />
            </Panel>
          ) : (
            <ul className="space-y-2">
              {rows.map((c) => {
                const history = byClient.get(c.id) ?? [];
                const l = loyalty(c, history);
                return (
                  <li key={c.id}>
                    <button type="button" aria-pressed={c.id === selectedId} onClick={() => setSelectedId(c.id)} className={cn("block w-full rounded-lg text-left", focusRing)}>
                      <span className={cn("flex items-center justify-between gap-2 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50", c.id === selectedId && "border-primary ring-1 ring-primary")}>
                        <span className="min-w-0">
                          <span className="block truncate text-kv-body font-semibold">{c.name}</span>
                          <span className="block text-kv-meta tabular-nums text-muted-foreground">{c.phone}</span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <StatusBadge tone="completed">{l.tier.label}</StatusBadge>
                          <span className="text-kv-meta text-muted-foreground">{l.visits} visite{l.visits > 1 ? "s" : ""}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={cn(!selected && "max-lg:hidden")}>
          {selected ? (
            <ClientDetail key={selected.id} client={selected} history={byClient.get(selected.id) ?? []} onBack={() => setSelectedId(null)} />
          ) : (
            <Panel>
              <StateBlock icon={UserRound} title="Sélectionnez un client" text="Historique, notes et points de fidélité s'affichent ici." />
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientDetail({ client, history, onBack }: { client: Client; history: Reservation[]; onBack: () => void }) {
  const { staff } = useAdminData();
  const [openId, setOpenId] = useState<string | null>(null);

  const l = loyalty(client, history);
  const sorted = [...history].sort((a, b) => `${b.date} ${b.lines[0].start}`.localeCompare(`${a.date} ${a.lines[0].start}`));
  const noShows = history.filter((r) => r.status === "no_show").length;
  const cancelled = history.filter((r) => r.status === "cancelled").length;
  const freq = new Map<string, number>();
  for (const r of history) if (r.status !== "cancelled") for (const line of r.lines) freq.set(line.practitionerId, (freq.get(line.practitionerId) ?? 0) + 1);
  const favId = [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const fav = staff.find((p) => p.id === favId)?.name;

  const columns: Column<Reservation>[] = [
    { id: "when", header: "Quand", cell: (r) => <><span className="inline-block first-letter:uppercase">{formatDateShort(r.date)}</span> · {r.lines[0].start} – {reservationEnd(r.lines)}</> },
    { id: "services", header: "Soins", cell: serviceNames, maxWidth: "max-w-[260px]" },
    { id: "status", header: "Statut", cell: (r) => <BookingStatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className={cn(controlGhost, "-ml-3 lg:hidden")}>
        <ArrowLeft aria-hidden /> Retour à la liste
      </button>

      <Panel>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-kv-title">{client.name}</h2>
            <p className="text-kv-meta tabular-nums text-muted-foreground">{client.phone}</p>
          </div>
          {client.fictive ? <FictiveTag /> : <StatusBadge tone="neutral">Créé via le parcours web (démo)</StatusBadge>}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric k="Visites terminées" v={String(l.visits)} />
          <Metric k="No-shows" v={String(noShows)} />
          <Metric k="Annulations" v={String(cancelled)} />
          <Metric k="Praticien habituel" v={fav ?? "—"} />
        </dl>
      </Panel>

      <Panel>
        <PanelHeader
          title={
            <span className="flex items-center gap-2">
              <Award className="size-4 text-primary" aria-hidden /> Fidélité
            </span>
          }
          action={<FictiveTag />}
        />
        <p className="text-kv-display tabular-nums">
          {l.points} <span className="text-kv-body text-muted-foreground">points · palier {l.tier.label}</span>
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(l.progress * 100)} aria-label="Progression vers le palier suivant">
          {/* check-design-allow(style-inline): largeur calculée de la jauge */}
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(l.progress * 100)}%` }} />
        </div>
        <p className="mt-2 text-kv-meta text-muted-foreground">
          {l.next ? `Encore ${l.toNext} points avant le palier ${l.next.label}.` : "Palier maximal atteint."} Règle FICTIVE : {brand.policies.loyalty.pointsPerVisit} points par visite terminée (+ bonus {client.bonusPoints}), à confirmer par {brand.name}.
        </p>
      </Panel>

      <ClientNotes client={client} />

      <Panel>
        <PanelHeader title="Historique" />
        {sorted.length === 0 ? (
          <StateBlock icon={UserRoundX} title="Aucune réservation" text="Ce client n'a pas encore de réservation sur ce site." className="py-6" />
        ) : (
          <DataTable
            label={`Historique de ${client.name}`}
            columns={columns}
            rows={sorted}
            rowKey={(r) => r.id}
            onRowClick={(r) => setOpenId(r.id)}
            mobileCard={(r) => (
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 text-kv-body">
                  <span className="block font-semibold"><span className="first-letter:uppercase">{formatDateShort(r.date)}</span> · {r.lines[0].start} – {reservationEnd(r.lines)}</span>
                  <span className="block truncate text-kv-meta text-muted-foreground">{serviceNames(r)}</span>
                </span>
                <BookingStatusBadge status={r.status} className="shrink-0" />
              </div>
            )}
          />
        )}
      </Panel>

      <ReservationDialog reservationId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

/** Notes d'un client : état local, pour que la frappe ne refasse pas le rendu de la fiche (historique compris). */
function ClientNotes({ client }: { client: Client }) {
  const { saveClientNotes } = useAdminData();
  const [notes, setNotes] = useState(client.notes);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const notesId = useId();
  useEffect(() => () => clearTimeout(timer.current), []);

  const save = () => {
    saveClientNotes(client.id, notes.trim());
    setSaved(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Panel>
      <Field label="Notes" htmlFor={notesId} hint="Préférences, allergies, remarques (500 caractères au plus).">
        <textarea id={notesId} className={textareaControl} value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} onBlur={() => notes.trim() !== client.notes && save()} placeholder="Préférences, allergies, remarques…" maxLength={500} />
      </Field>
      <div className="mt-4 flex items-center gap-2">
        <button type="button" onClick={save} className={controlPrimary}>
          Enregistrer la note
        </button>
        <p role="status" className="text-kv-meta text-success">{saved ? "Note enregistrée (en mémoire, démo)." : ""}</p>
      </div>
    </Panel>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0 rounded-md bg-muted p-3">
      <dt className="text-kv-meta text-muted-foreground">{k}</dt>
      <dd className="mt-1 truncate text-kv-title tabular-nums">{v}</dd>
    </div>
  );
}
