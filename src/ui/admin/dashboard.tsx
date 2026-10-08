"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CalendarX, Hourglass, MessageCircle, Percent, Wallet } from "lucide-react";
import { brand } from "@/brand/brand.config";
import type { Reservation } from "@/core/types";
import { useAdminData } from "@/core/state/store";
import { activeReservations, estimatedRevenue, occupancyRate, pendingDeposits, periodDays, remindersDue, upcoming, weekBreakdown, type KpiContext, type Period } from "@/core/booking/kpis";
import { formatCountdown, remainingMs } from "@/core/booking/holds";
import { reminderLink } from "@/core/whatsapp/reminders";
import { useRuntime } from "@/ui/runtime-provider";
import { reservationEnd } from "@/core/booking/scheduling";
import { useNow } from "@/core/lib/use-now";
import { nowMinutes, formatDate, formatDateLong, formatDateShort } from "@/core/lib/dates";
import { cn, formatPrice } from "@/core/lib/utils";
import { ReservationDialog } from "@/ui/admin/reservation-dialog";
import { controlSuccess, focusRing } from "@/ui/kv/control-classes";
import { FictiveTag } from "@/ui/kv/fictive-tag";
import { PageHeader } from "@/ui/kv/page-header";
import { Panel, PanelHeader } from "@/ui/kv/panel";
import { Segmented } from "@/ui/kv/segmented";
import { LoadingRegion, Skeleton } from "@/ui/kv/skeleton";
import { StateBlock } from "@/ui/kv/state-block";
import { BookingStatusBadge } from "@/ui/kv/status-badge";

const pct = (v: number | null) => (v == null ? "—" : `${Math.round(v * 100)} %`);

export function Dashboard() {
  const { recipientless } = useRuntime();
  const data = useAdminData();
  const { ready, today, reservations, staff, site, markReminderSent } = data;
  const [period, setPeriod] = useState<Period>("day");
  const [openId, setOpenId] = useState<string | null>(null);
  const now = useNow(1000);

  const ctx = useMemo<KpiContext>(
    () => ({ reservations, staff, services: brand.services, opening: brand.opening, policies: brand.policies, today, nowMs: now }),
    [reservations, staff, today, now],
  );

  if (!ready) {
    return (
      <LoadingRegion label="Chargement du tableau de bord" className="space-y-6">
        <Skeleton className="h-[52px] w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[132px]" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[272px]" />
          <Skeleton className="h-[272px]" />
        </div>
        <Skeleton className="h-[336px]" />
      </LoadingRegion>
    );
  }

  const days = periodDays(period, today);
  const label = period === "day" ? "aujourd'hui" : "cette semaine";
  const active = activeReservations(ctx, days);
  const pendingAll = pendingDeposits(reservations);
  const occupancy = occupancyRate(ctx, days);
  const revenue = estimatedRevenue(ctx, days);
  const next = upcoming(reservations, today, nowMinutes());
  const reminders = remindersDue(reservations, today);
  const week = weekBreakdown(ctx);
  const rctx = { brand: brand.name, siteName: site.name, services: brand.services, staff, recipientless };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle={
          <>
            {site.name} · <span className="first-letter:uppercase">{formatDateLong(today)}</span>
          </>
        }
        action={
          <Segmented
            label="Période"
            value={period}
            onChange={setPeriod}
            options={[
              { value: "day", label: "Jour" },
              { value: "week", label: "Semaine" },
            ]}
          />
        }
      />

      <section aria-label="Indicateurs" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi dominant icon={CalendarCheck} label={`Réservations ${label}`} value={String(active.length)} note={`dont ${active.filter((r) => r.status === "pending_deposit").length} en attente d'acompte`} />
        <Kpi
          icon={Hourglass}
          label="Acomptes en attente"
          value={String(pendingAll.count)}
          note={pendingAll.count ? `${formatPrice(pendingAll.amount)}${pendingAll.nextExpiry && now ? ` · prochaine expiration dans ${formatCountdown(remainingMs(pendingAll.nextExpiry, now))}` : ""}` : "Aucun acompte en attente"}
        />
        <Kpi icon={Percent} label={`Taux de remplissage ${label}`} value={pct(occupancy)} note="Minutes réservées ÷ minutes d'ouverture × praticiens actifs (créneaux de 60 min indicatifs)">
          {occupancy != null && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(occupancy * 100)} aria-label="Taux de remplissage">
              {/* check-design-allow(style-inline): largeur calculée de la jauge */}
              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(occupancy * 100)}%` }} />
            </div>
          )}
        </Kpi>
        <Kpi icon={Wallet} label={`CA estimé ${label}`} value={formatPrice(revenue)} note="Réservations confirmées ou terminées × barème fictif par catégorie : aucun prix réel connu" />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Prochains rendez-vous" />
          {next.length === 0 ? (
            <StateBlock icon={CalendarX} title="Aucun rendez-vous à venir" text="Aucune réservation à venir pour ce site." className="py-6" />
          ) : (
            <ul className="divide-y">
              {next.map((r) => (
                <ReservationRow key={r.id} r={r} onOpen={setOpenId} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Rappels J-1 à envoyer" />
          <p className="-mt-2 mb-2 text-kv-meta text-muted-foreground">Rendez-vous de demain, confirmés ou en attente d&apos;acompte. L&apos;envoi se fait depuis WhatsApp.</p>
          {reminders.length === 0 ? (
            <StateBlock icon={MessageCircle} title="Rien à rappeler" text="Aucun rendez-vous demain." className="py-6" />
          ) : (
            <ul className="divide-y">
              {reminders.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="text-kv-body font-semibold">{r.customerName}</p>
                    <p className="text-kv-meta text-muted-foreground">
                      {r.lines[0].start} · {r.lines.map((l) => brand.services.find((s) => s.id === l.serviceId)?.name).join(" + ")}
                    </p>
                    {r.reminderSentAt != null && <p className="text-kv-meta text-success">Rappel ouvert dans WhatsApp ✓</p>}
                  </div>
                  <a href={reminderLink(r, rctx)} target="_blank" rel="noopener noreferrer" onClick={() => markReminderSent(r.id)} className={controlSuccess}>
                    <MessageCircle aria-hidden /> {r.reminderSentAt != null ? "Renvoyer" : "Rappeler"}
                    <span className="sr-only"> {r.customerName}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <WeekChart days={week} today={today} />

      <ReservationDialog reservationId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

/** Indicateur : un seul chiffre dominant par écran (`dominant`), les autres en `text-kv-title`. */
function Kpi({ icon: Icon, label, value, note, dominant, children }: { icon: typeof Percent; label: string; value: string; note: string; dominant?: boolean; children?: React.ReactNode }) {
  return (
    <Panel className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-kv-meta text-muted-foreground">
          <Icon className="size-4 shrink-0 text-primary" aria-hidden /> {label}
        </p>
        <FictiveTag />
      </div>
      <p className={cn("mt-2 tabular-nums", dominant ? "text-kv-display" : "text-kv-title")}>{value}</p>
      {children}
      <p className="mt-2 text-kv-meta text-muted-foreground">{note}</p>
    </Panel>
  );
}

function ReservationRow({ r, onOpen }: { r: Reservation; onOpen: (id: string) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onOpen(r.id)} className={cn("flex min-h-14 w-full items-center justify-between gap-2 rounded-md py-2 text-left transition-colors hover:bg-muted/50", focusRing)}>
        <span className="min-w-0">
          <span className="block text-kv-body font-semibold">{r.customerName}</span>
          <span className="block truncate text-kv-meta text-muted-foreground">
            <span className="first-letter:uppercase">{formatDateShort(r.date)}</span> · {r.lines[0].start} – {reservationEnd(r.lines)} · {r.lines.map((l) => brand.services.find((s) => s.id === l.serviceId)?.name).join(" + ")}
          </span>
        </span>
        <BookingStatusBadge status={r.status} className="shrink-0" />
      </button>
    </li>
  );
}

/** Réservations par jour de la semaine : une seule série (même teinte), barres fines, étiquettes sélectives, tableau équivalent. */
function WeekChart({ days, today }: { days: ReturnType<typeof weekBreakdown>; today: string }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  const peak = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
  const H = 140;
  return (
    <Panel>
      <PanelHeader title="Réservations de la semaine" action={<FictiveTag />} />
      <p className="-mt-2 text-kv-meta text-muted-foreground">Hors annulées. Survolez ou focalisez une barre pour le détail.</p>
      {/* check-design-allow(style-inline): hauteur calculée du graphique */}
      <ul className="relative mt-6 flex items-end justify-between gap-2 border-b" style={{ height: H + 36 }} aria-label="Graphique : réservations par jour">
        {/* check-design-allow(style-inline): position calculée de la ligne de repère */}
        <li aria-hidden className="pointer-events-none absolute inset-x-0 border-t" style={{ bottom: 36 + H }}>
          <span className="absolute -top-5 left-0 text-kv-meta tabular-nums text-muted-foreground">{max}</span>
        </li>
        {days.map((d, i) => {
          const h = Math.round((d.count / max) * H);
          const isToday = d.date === today;
          const labelled = d.count > 0 && (d.date === peak.date || isToday);
          return (
            <li key={d.date} tabIndex={0} className={cn("group relative flex h-full flex-1 flex-col items-center justify-end rounded-md", focusRing)} aria-label={`${formatDateShort(d.date)} : ${d.count} réservation${d.count > 1 ? "s" : ""}`}>
              <span role="tooltip" className={cn("pointer-events-none absolute -top-2 z-10 w-max max-w-44 -translate-y-full rounded-md border bg-popover px-2 py-1 text-kv-meta text-popover-foreground opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100", i / (days.length - 1) < 0.4 ? "left-0" : i / (days.length - 1) > 0.6 ? "right-0" : "left-1/2 -translate-x-1/2")}>
                {d.count} réservation{d.count > 1 ? "s" : ""} · CA estimé {formatPrice(d.revenue)} (FICTIF)
              </span>
              {labelled && <span className="mb-1 text-kv-meta font-semibold tabular-nums">{d.count}</span>}
              {/* check-design-allow(style-inline): hauteur calculée de la barre */}
              <span className="block w-full max-w-6 rounded-t-sm bg-primary" style={{ height: Math.max(h, d.count > 0 ? 2 : 0) }} />
              <span className={cn("mt-2 h-7 text-kv-meta capitalize", isToday ? "font-semibold text-foreground" : "text-muted-foreground")} aria-hidden>
                {formatDate(d.date, { weekday: "short" })}
              </span>
            </li>
          );
        })}
      </ul>
      <details className="mt-4">
        <summary className={cn("flex min-h-11 cursor-pointer items-center rounded-md text-kv-body text-primary-text underline underline-offset-4 md:min-h-8", focusRing)}>Voir les valeurs en tableau</summary>
        <table className="mt-2 w-full text-kv-body">
          <caption className="sr-only">Réservations et chiffre d&apos;affaires estimé (fictif) par jour</caption>
          <thead>
            <tr className="h-9 text-left text-kv-label uppercase text-muted-foreground">
              <th scope="col">Jour</th>
              <th scope="col">Réservations</th>
              <th scope="col" className="text-right">CA estimé (FICTIF)</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date} className="h-10 border-t">
                <th scope="row" className="text-left font-medium capitalize">{formatDate(d.date, { weekday: "long", day: "numeric", month: "short" })}</th>
                <td className="tabular-nums">{d.count}</td>
                <td className="text-right tabular-nums">{formatPrice(d.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Panel>
  );
}
