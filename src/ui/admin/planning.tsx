"use client";

import { useState } from "react";
import { CalendarOff, ChevronLeft, ChevronRight } from "lucide-react";
import { brand } from "@/brand/brand.config";
import type { Reservation, ReservationLine } from "@/core/types";
import { useAdminData } from "@/core/state/store";
import { hoursFor } from "@/core/booking/availability";
import { reservationEnd } from "@/core/booking/scheduling";
import { STATUS_LABELS, STATUS_ORDER } from "@/core/booking/status";
import { addDays, endTime, formatDate, formatDateLong, timeToMin, weekDays } from "@/core/lib/dates";
import { cn } from "@/core/lib/utils";
import { ReservationDialog } from "@/ui/admin/reservation-dialog";
import { controlIcon, controlSecondary, focusRing } from "@/ui/kv/control-classes";
import { PageHeader } from "@/ui/kv/page-header";
import { Panel } from "@/ui/kv/panel";
import { Segmented } from "@/ui/kv/segmented";
import { LoadingRegion, Skeleton } from "@/ui/kv/skeleton";
import { StateBlock } from "@/ui/kv/state-block";
import { BookingStatusBadge, STATUS_BLOCK, STATUS_DOT } from "@/ui/kv/status-badge";

type View = "jour" | "semaine";
type GroupBy = "praticien" | "salle";

const HOUR_PX = 64;

const serviceName = (id: string) => brand.services.find((s) => s.id === id)?.name ?? id;

export function Planning() {
  const { ready, today, reservations, staff, rooms, site } = useAdminData();
  const [view, setView] = useState<View>("jour");
  const [groupBy, setGroupBy] = useState<GroupBy>("praticien");
  const [date, setDate] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  if (!ready) {
    return (
      <LoadingRegion label="Chargement du planning" className="space-y-6">
        <Skeleton className="h-[52px] w-64" />
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-[640px]" />
      </LoadingRegion>
    );
  }

  const current = date ?? today;
  const step = view === "jour" ? 1 : 7;
  const days = weekDays(current);
  const label = view === "jour" ? formatDateLong(current) : `Semaine du ${formatDate(days[0], { day: "numeric", month: "long" })} au ${formatDate(days[6], { day: "numeric", month: "long" })}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Planning" subtitle={<span className="inline-block first-letter:uppercase">{label} · {site.name}</span>} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button type="button" className={controlIcon} onClick={() => setDate(addDays(current, -step))} aria-label={view === "jour" ? "Jour précédent" : "Semaine précédente"}>
            <ChevronLeft aria-hidden />
          </button>
          <button type="button" className={controlIcon} onClick={() => setDate(addDays(current, step))} aria-label={view === "jour" ? "Jour suivant" : "Semaine suivante"}>
            <ChevronRight aria-hidden />
          </button>
          <button type="button" className={controlSecondary} onClick={() => setDate(today)}>
            Aujourd&apos;hui
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {view === "jour" && (
            <Segmented
              label="Colonnes"
              value={groupBy}
              onChange={setGroupBy}
              options={[
                { value: "praticien", label: "Praticiens" },
                { value: "salle", label: "Salles" },
              ]}
              className="max-md:hidden"
            />
          )}
          <Segmented
            label="Type de vue"
            value={view}
            onChange={setView}
            options={[
              { value: "jour", label: "Jour" },
              { value: "semaine", label: "Semaine" },
            ]}
          />
        </div>
      </div>

      {view === "jour" ? (
        <DayView date={current} reservations={reservations} staff={staff} rooms={rooms} groupBy={groupBy} onOpen={setOpenId} />
      ) : (
        <WeekView
          days={days}
          today={today}
          reservations={reservations}
          onOpen={setOpenId}
          onPickDay={(d) => {
            setDate(d);
            setView("jour");
          }}
        />
      )}

      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-kv-meta text-muted-foreground" aria-label="Légende des statuts">
        {STATUS_ORDER.filter((s) => s !== "cancelled").map((s) => (
          <li key={s} className="inline-flex items-center gap-2">
            <span aria-hidden className={cn("size-2 rounded-full", STATUS_DOT[s])} /> {STATUS_LABELS[s]}
          </li>
        ))}
        <li>Les réservations annulées libèrent le créneau et ne sont pas affichées.</li>
      </ul>

      <ReservationDialog reservationId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

interface Entry {
  r: Reservation;
  l: ReservationLine;
}

function DayView({ date, reservations, staff, rooms, groupBy, onOpen }: { date: string; reservations: Reservation[]; staff: ReturnType<typeof useAdminData>["staff"]; rooms: ReturnType<typeof useAdminData>["rooms"]; groupBy: GroupBy; onOpen: (id: string) => void }) {
  const hours = hoursFor(brand.opening, date);
  const dayRes = reservations.filter((r) => r.date === date);
  const entries: Entry[] = dayRes.filter((r) => r.status !== "cancelled").flatMap((r) => r.lines.map((l) => ({ r, l }))).sort((a, b) => a.l.start.localeCompare(b.l.start));
  const hiddenCancelled = dayRes.filter((r) => r.status === "cancelled").length;

  if (!hours) {
    return (
      <Panel>
        <StateBlock icon={CalendarOff} title="Site fermé ce jour-là" text="Aucun créneau n'est ouvert à la réservation. Choisissez un autre jour." />
      </Panel>
    );
  }
  if (entries.length === 0) {
    return (
      <Panel>
        <StateBlock icon={CalendarOff} title="Aucune réservation ce jour-là" text={hiddenCancelled > 0 ? `${hiddenCancelled} réservation(s) annulée(s) masquée(s).` : "Les nouvelles réservations apparaîtront ici."} />
      </Panel>
    );
  }

  const open = Math.floor(timeToMin(hours.open) / 60) * 60;
  const close = Math.ceil(timeToMin(hours.close) / 60) * 60;
  const hourMarks = Array.from({ length: Math.ceil((close - open) / 60) }, (_, i) => open + i * 60);
  const height = ((close - open) / 60) * HOUR_PX;
  const columns =
    groupBy === "praticien"
      ? staff.filter((p) => p.active || entries.some((e) => e.l.practitionerId === p.id)).map((p) => ({ id: p.id, title: p.name, sub: p.role, match: (e: Entry) => e.l.practitionerId === p.id }))
      : rooms.filter((x) => x.active || entries.some((e) => e.l.roomId === x.id)).map((x) => ({ id: x.id, title: x.name, sub: "", match: (e: Entry) => e.l.roomId === x.id }));

  return (
    <>
      {/* Mobile : agenda chronologique */}
      <ul className="space-y-2 md:hidden" aria-label="Agenda du jour">
        {entries.map(({ r, l }) => (
          <li key={`${r.id}-${l.serviceId}`}>
            <button type="button" onClick={() => onOpen(r.id)} className={cn("w-full rounded-lg border border-l-[3px] p-3 text-left", focusRing, STATUS_BLOCK[r.status])}>
              <span className="flex items-center justify-between gap-2">
                <span className="text-kv-section tabular-nums">{l.start} – {endTime(l.start, l.durationMin)}</span>
                <BookingStatusBadge status={r.status} />
              </span>
              <span className="mt-1 block text-kv-body">{serviceName(l.serviceId)}</span>
              <span className="block text-kv-meta text-muted-foreground">
                {r.customerName} · {staff.find((p) => p.id === l.practitionerId)?.name ?? "—"} · {rooms.find((x) => x.id === l.roomId)?.name ?? "—"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Bureau : grille par praticien ou par salle */}
      <div className="overflow-x-auto rounded-lg border bg-card max-md:hidden">
        {/* check-design-allow: largeur minimale calculée (nombre de colonnes) */}
        <div className="flex" style={{ minWidth: 56 + columns.length * 150 }}>
          <div className="w-14 shrink-0 border-r">
            <div className="h-12 border-b" />
            {/* check-design-allow: hauteur calculée (heures d'ouverture) */}
            <div className="relative" style={{ height }}>
              {hourMarks.map((h) => (
                // check-design-allow: position calculée de l'heure
                <span key={h} className="absolute right-2 -translate-y-1/2 text-kv-meta tabular-nums text-muted-foreground" style={{ top: ((h - open) / 60) * HOUR_PX }}>
                  {Math.floor(h / 60)}h
                </span>
              ))}
            </div>
          </div>
          {columns.map((c) => (
            <div key={c.id} className="min-w-[150px] flex-1 border-r last:border-r-0">
              <div className="flex h-12 flex-col items-center justify-center border-b px-1 text-center">
                <span className="text-kv-section">{c.title}</span>
                {c.sub && <span className="text-kv-meta text-muted-foreground">{c.sub}</span>}
              </div>
              {/* check-design-allow: hauteur calculée (heures d'ouverture) */}
              <div className="relative" style={{ height }}>
                {hourMarks.map((h) => (
                  // check-design-allow: position calculée du trait d'heure
                  <div key={h} className="absolute inset-x-0 border-t" style={{ top: ((h - open) / 60) * HOUR_PX }} />
                ))}
                {entries.filter(c.match).map(({ r, l }) => (
                  <button
                    key={`${r.id}-${l.serviceId}`}
                    type="button"
                    onClick={() => onOpen(r.id)}
                    title={`${r.customerName} · ${STATUS_LABELS[r.status]}`}
                    className={cn("absolute inset-x-1 overflow-hidden rounded-md border border-l-[3px] px-2 py-1 text-left text-kv-meta", focusRing, STATUS_BLOCK[r.status])}
                    // check-design-allow: position et hauteur calculées du bloc (heure de début, durée)
                    style={{ top: ((timeToMin(l.start) - open) / 60) * HOUR_PX + 1, height: (l.durationMin / 60) * HOUR_PX - 2 }}
                  >
                    <span className="block font-semibold tabular-nums">{l.start} – {endTime(l.start, l.durationMin)}</span>
                    <span className="block truncate">{serviceName(l.serviceId)}</span>
                    <span className="block truncate text-muted-foreground">{r.customerName}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {hiddenCancelled > 0 && <p className="text-kv-meta text-muted-foreground">{hiddenCancelled} réservation(s) annulée(s) masquée(s) ce jour-là.</p>}
    </>
  );
}

function WeekView({ days, today, reservations, onOpen, onPickDay }: { days: string[]; today: string; reservations: Reservation[]; onOpen: (id: string) => void; onPickDay: (d: string) => void }) {
  return (
    <div className="grid gap-2 md:grid-cols-7 md:gap-0 md:overflow-hidden md:rounded-lg md:border md:bg-card">
      {days.map((d) => {
        const list = reservations.filter((r) => r.date === d && r.status !== "cancelled").sort((a, b) => a.lines[0].start.localeCompare(b.lines[0].start));
        const closed = hoursFor(brand.opening, d) === null;
        return (
          <section key={d} aria-label={formatDateLong(d)} className="rounded-lg border bg-card md:rounded-none md:border-0 md:border-r md:last:border-r-0">
            <button
              type="button"
              onClick={() => onPickDay(d)}
              className={cn("flex min-h-16 w-full items-center justify-between border-b px-3 py-2 text-kv-body transition-colors hover:bg-muted md:flex-col md:justify-center", focusRing, d === today && "bg-secondary text-secondary-foreground")}
            >
              <span className="capitalize">{formatDate(d, { weekday: "short" })}</span>
              <span className="text-kv-title tabular-nums">{formatDate(d, { day: "numeric" })}</span>
              <span className="text-kv-meta text-muted-foreground">{closed ? "Fermé" : `${list.length} résa`}</span>
            </button>
            <ul className="min-h-12 space-y-2 p-2 md:min-h-40">
              {list.map((r) => (
                <li key={r.id}>
                  <button type="button" onClick={() => onOpen(r.id)} className={cn("w-full rounded-md border border-l-[3px] px-2 py-1 text-left text-kv-meta", focusRing, STATUS_BLOCK[r.status])}>
                    <span className="block font-semibold tabular-nums">{r.lines[0].start} – {reservationEnd(r.lines)}</span>
                    <span className="block truncate">{r.lines.map((l) => serviceName(l.serviceId)).join(" + ")}</span>
                    <span className="block truncate text-muted-foreground">{r.customerName}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
