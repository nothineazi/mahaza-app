"use client";

import { useId, useMemo, useState } from "react";
import { Download, Search, SearchX } from "lucide-react";
import { brand } from "@/brand/brand.config";
import type { BookingStatus, Reservation } from "@/core/types";
import { useAdminData } from "@/core/state/store";
import { reservationsToCsv } from "@/core/lib/csv";
import { downloadText } from "@/core/lib/download";
import { reservationEnd } from "@/core/booking/scheduling";
import { STATUS_LABELS, STATUS_ORDER, isDepositReceived } from "@/core/booking/status";
import { formatDateShort } from "@/core/lib/dates";
import { cn, formatPrice } from "@/core/lib/utils";
import { ReservationDialog } from "@/ui/admin/reservation-dialog";
import { controlChip, controlGhost, controlSecondary, fieldControl } from "@/ui/kv/control-classes";
import { DataTable, type Column, type SortState } from "@/ui/kv/data-table";
import { Field } from "@/ui/kv/field";
import { PageHeader } from "@/ui/kv/page-header";
import { Panel } from "@/ui/kv/panel";
import { LoadingRegion, Skeleton } from "@/ui/kv/skeleton";
import { StateBlock } from "@/ui/kv/state-block";
import { BookingStatusBadge } from "@/ui/kv/status-badge";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const serviceNames = (r: Reservation) => r.lines.map((l) => brand.services.find((s) => s.id === l.serviceId)?.name).join(" + ");
const staffNames = (ids: string[], staff: { id: string; name: string }[]) => [...new Set(ids)].map((id) => staff.find((p) => p.id === id)?.name ?? "—").join(", ");

export function ReservationsList() {
  const { ready, reservations, staff, site } = useAdminData();
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<BookingStatus[]>([]);
  const [practitioner, setPractitioner] = useState("");
  const [service, setService] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "when", dir: "asc" });
  const [openId, setOpenId] = useState<string | null>(null);
  const ids = { q: useId(), p: useId(), s: useId(), from: useId(), to: useId() };

  const rows = useMemo(() => {
    const q = norm(query.trim());
    return reservations
      .filter((r) => statuses.length === 0 || statuses.includes(r.status))
      .filter((r) => !practitioner || r.lines.some((l) => l.practitionerId === practitioner))
      .filter((r) => !service || r.lines.some((l) => l.serviceId === service))
      .filter((r) => (!from || r.date >= from) && (!to || r.date <= to))
      .filter((r) => !q || norm(r.customerName).includes(q) || norm(r.reference).includes(q) || r.customerPhone.replace(/\D/g, "").includes(q.replace(/\D/g, "") || "\u0000"))
      .sort((a, b) => {
        const k = `${a.date} ${a.lines[0].start}`.localeCompare(`${b.date} ${b.lines[0].start}`);
        return sort.dir === "desc" ? -k : k;
      });
  }, [reservations, query, statuses, practitioner, service, from, to, sort.dir]);

  if (!ready) {
    return (
      <LoadingRegion label="Chargement des réservations" className="space-y-6">
        <Skeleton className="h-[52px] w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[72px]" />
          ))}
        </div>
        <Skeleton className="h-[260px]" />
        <Skeleton className="h-[376px]" />
      </LoadingRegion>
    );
  }

  const filtered = Boolean(query || statuses.length || practitioner || service || from || to);
  const count = (s: BookingStatus) => reservations.filter((r) => r.status === s).length;
  const total = reservations.filter((r) => isDepositReceived(r.status)).reduce((sum, r) => sum + r.depositAmount, 0);

  const exportCsv = () =>
    downloadText(`reservations-${site.id}-${new Date().toISOString().slice(0, 10)}.csv`, reservationsToCsv(rows, { siteName: site.name, services: brand.services, staff, rooms: brand.rooms }), "text/csv;charset=utf-8");

  const reset = () => {
    setQuery("");
    setStatuses([]);
    setPractitioner("");
    setService("");
    setFrom("");
    setTo("");
  };

  const columns: Column<Reservation>[] = [
    { id: "customer", header: "Client", cell: (r) => <span className="font-semibold">{r.customerName}</span>, maxWidth: "max-w-[220px]" },
    { id: "status", header: "Statut", cell: (r) => <BookingStatusBadge status={r.status} /> },
    {
      id: "when",
      header: "Quand",
      sortable: true,
      cell: (r) => (
        <>
          <span className="inline-block first-letter:uppercase">{formatDateShort(r.date)}</span> · {r.lines[0].start} – {reservationEnd(r.lines)}
        </>
      ),
    },
    { id: "services", header: "Soins", cell: serviceNames, priority: 2, maxWidth: "max-w-[260px]" },
    { id: "staff", header: "Praticien", cell: (r) => staffNames(r.lines.map((l) => l.practitionerId), staff), priority: 3, maxWidth: "max-w-[160px]" },
    { id: "phone", header: "Téléphone", cell: (r) => r.customerPhone, priority: 3 },
    { id: "reference", header: "Référence", cell: (r) => <span className="font-mono text-kv-meta text-muted-foreground">{r.reference}</span>, priority: 3 },
    { id: "deposit", header: "Acompte", cell: (r) => formatPrice(r.depositAmount), align: "right", priority: 2 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Réservations"
        subtitle={site.name}
        action={
          <button type="button" onClick={exportCsv} disabled={rows.length === 0} className={controlSecondary}>
            <Download aria-hidden /> Exporter en CSV ({rows.length} ligne{rows.length > 1 ? "s" : ""})
          </button>
        }
      />

      <section aria-label="Synthèse" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Réservations" value={String(reservations.length)} />
        <Stat label="En attente d'acompte" value={String(count("pending_deposit"))} />
        <Stat label="Confirmées" value={String(count("confirmed"))} />
        <Stat label="Acomptes encaissés (FICTIF)" value={formatPrice(total)} />
      </section>

      <Panel aria-label="Filtres" className="space-y-4">
        <div className="relative">
          <label htmlFor={ids.q} className="sr-only">Rechercher un client, un téléphone ou une référence</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input id={ids.q} type="search" className={cn(fieldControl, "pl-9")} placeholder="Rechercher un client, un téléphone ou une référence" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div role="group" aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
          {STATUS_ORDER.map((s) => (
            <button key={s} type="button" aria-pressed={statuses.includes(s)} onClick={() => setStatuses((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))} className={controlChip}>
              {STATUS_LABELS[s]} <span className="tabular-nums opacity-80">({count(s)})</span>
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Praticien" htmlFor={ids.p}>
            <select id={ids.p} className={fieldControl} value={practitioner} onChange={(e) => setPractitioner(e.target.value)}>
              <option value="">Tous</option>
              {staff.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Soin" htmlFor={ids.s}>
            <select id={ids.s} className={fieldControl} value={service} onChange={(e) => setService(e.target.value)}>
              <option value="">Tous</option>
              {brand.categories.map((c) => (
                <optgroup key={c} label={c}>
                  {brand.services.filter((s) => s.category === c).map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label="Du" htmlFor={ids.from}>
            <input id={ids.from} type="date" className={fieldControl} value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="Au" htmlFor={ids.to}>
            <input id={ids.to} type="date" className={fieldControl} value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p aria-live="polite" className="text-kv-meta text-muted-foreground">
            {rows.length} résultat{rows.length > 1 ? "s" : ""}{filtered ? " (filtres actifs)" : ""}
          </p>
          {filtered && (
            <button type="button" onClick={reset} className={controlGhost}>
              Réinitialiser les filtres
            </button>
          )}
        </div>
      </Panel>

      {rows.length === 0 ? (
        <Panel>
          <StateBlock
            icon={SearchX}
            title="Aucune réservation ne correspond"
            text="Aucune réservation ne répond à ces filtres."
            action={
              filtered && (
                <button type="button" onClick={reset} className={controlSecondary}>
                  Réinitialiser les filtres
                </button>
              )
            }
          />
        </Panel>
      ) : (
        <DataTable
          label="Liste des réservations"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={(r) => setOpenId(r.id)}
          sort={sort}
          onSort={(key) => setSort((s) => ({ key, dir: s.dir === "asc" ? "desc" : "asc" }))}
          mobileCard={(r) => (
            <div className="space-y-1 text-kv-body">
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 truncate font-semibold">{r.customerName}</span>
                <BookingStatusBadge status={r.status} className="shrink-0" />
              </div>
              <p>{serviceNames(r)}</p>
              <p className="text-kv-meta text-muted-foreground">
                <span className="inline-block first-letter:uppercase">{formatDateShort(r.date)}</span>, {r.lines[0].start} – {reservationEnd(r.lines)} · {staffNames(r.lines.map((l) => l.practitionerId), staff)}
              </p>
              <p className="flex flex-wrap items-center justify-between gap-x-2 text-kv-meta text-muted-foreground">
                <span className="whitespace-nowrap"><span className="font-mono">{r.reference}</span> · {r.customerPhone}</span>
                <span className="whitespace-nowrap tabular-nums">Acompte {formatPrice(r.depositAmount)}</span>
              </p>
            </div>
          )}
        />
      )}

      <ReservationDialog reservationId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Panel>
      <p className="text-kv-meta text-muted-foreground">{label}</p>
      <p className="mt-1 text-kv-title tabular-nums">{value}</p>
    </Panel>
  );
}
