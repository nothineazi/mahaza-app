"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRightLeft, Clock, MessageCircle, UserRound, X } from "lucide-react";
import { brand } from "@/brand/brand.config";
import type { BookingStatus, Reservation } from "@/core/types";
import { useAppStore, type Result } from "@/core/state/store";
import { TRANSITIONS, checkTransition } from "@/core/booking/lifecycle";
import { transitionLabel } from "@/core/booking/status";
import { buildMovedLines, findConflicts, hasBlocking, type Conflict } from "@/core/booking/conflicts";
import { formatCountdown, remainingMs } from "@/core/booking/holds";
import { reminderLink } from "@/core/whatsapp/reminders";
import { useRuntime } from "@/ui/runtime-provider";
import { reservationEnd } from "@/core/booking/scheduling";
import { useNow } from "@/core/lib/use-now";
import { hoursFor } from "@/core/booking/availability";
import { addDays, endTime, formatDateLong, minToTime, timeToMin } from "@/core/lib/dates";
import { getSite, multiSite } from "@/core/sites/sites";
import { cn, formatPrice } from "@/core/lib/utils";
import { serviceNames } from "@/ui/admin/helpers";
import { ActionBar, type BarAction } from "@/ui/kv/action-bar";
import { controlSecondary, fieldControl } from "@/ui/kv/control-classes";
import { Field } from "@/ui/kv/field";
import { FictiveTag } from "@/ui/kv/fictive-tag";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@/ui/kv/modal";
import { BookingStatusBadge } from "@/ui/kv/status-badge";
import { vocab } from "@/brand/copy/vocab";

const serviceName = (id: string) => brand.services.find((s) => s.id === id)?.name;
const hhmm = (ms: number) => new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" }).format(ms);

/** Action primaire de la fiche selon le statut (matrice ADR-039) ; les autres transitions restent visibles en secondaire. */
const PRIMARY_TRANSITION: Partial<Record<BookingStatus, BookingStatus>> = { pending_deposit: "confirmed", confirmed: "completed" };

/** Détail d'une réservation : cycle de vie, déplacement (avec détection de conflit), rappel WhatsApp J-1. */
export function ReservationDialog({ reservationId, onClose }: { reservationId: string | null; onClose: () => void }) {
  const { reservations } = useAppStore();
  const reservation = reservations.find((r) => r.id === reservationId);
  return (
    <Modal open={Boolean(reservation)} onOpenChange={(o) => !o && onClose()}>
      <ModalContent size="lg">{reservation && <Detail key={reservation.id} reservation={reservation} onClose={onClose} />}</ModalContent>
    </Modal>
  );
}

function Detail({ reservation, onClose }: { reservation: Reservation; onClose: () => void }) {
  const store = useAppStore();
  const router = useRouter();
  const { staff, rooms, today, setStatus, markReminderSent, setFocusClientId } = store;
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string; conflicts?: Conflict[] } | null>(null);
  const [moving, setMoving] = useState(false);
  const whyId = useId();
  const site = getSite(reservation.siteId);
  const status = reservation.status;
  const { recipientless } = useRuntime();
  const rctx = { brand: brand.name, siteName: site.name, services: brand.services, staff, recipientless };

  const apply = (to: BookingStatus) => {
    const res: Result = setStatus(reservation.id, to);
    setMessage(res.ok ? { tone: "ok", text: `Statut mis à jour : ${transitionLabel(status, to)}.` } : { tone: "error", text: res.reason, conflicts: res.conflicts });
  };

  const tomorrow = reservation.date === addDays(today, 1);
  const canRemind = status === "confirmed" || status === "pending_deposit";

  // Transitions : une primaire adaptée au statut, les autres en secondaire, l'annulation dans le menu.
  const checks = TRANSITIONS[status].map((to) => ({ to, check: checkTransition(reservation, to, today) }));
  const toAction = ({ to, check }: (typeof checks)[number]): BarAction => ({ label: transitionLabel(status, to), onClick: () => apply(to), disabled: !check.ok, describedBy: check.ok ? undefined : `${whyId}-${to}` });
  const primaryKey = PRIMARY_TRANSITION[status];
  const primaryCheck = checks.find((c) => c.to === primaryKey);
  const primary = primaryCheck && toAction(primaryCheck);
  const cancel = checks.find((c) => c.to === "cancelled");
  const secondary: BarAction[] = [
    ...checks.filter((c) => c.to !== primaryKey && c.to !== "cancelled").map(toAction),
    { label: "Déplacer", icon: ArrowRightLeft, onClick: () => setMoving((m) => !m) },
    ...(canRemind ? [{ label: "Rappel WhatsApp", icon: MessageCircle, href: reminderLink(reservation, rctx), onClick: () => markReminderSent(reservation.id), tone: "success" as const }] : []),
  ];
  const unavailable = checks.flatMap(({ to, check }) => (check.ok ? [] : [{ to, reason: check.reason }]));

  return (
    <>
      <ModalHeader
        title={serviceNames(reservation)}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>Réf. <span className="font-mono">{reservation.reference}</span></span>
            <BookingStatusBadge status={status} />
            {reservation.fictive && <FictiveTag />}
          </span>
        }
      />
      <ModalBody>
        <dl className="divide-y rounded-lg border text-kv-body">
          <Row k="Client">
            <button
              type="button"
              onClick={() => {
                setFocusClientId(reservation.clientId);
                onClose();
                router.push("/admin/clients");
              }}
              className="inline-flex min-h-8 items-center gap-1 rounded-sm font-semibold text-primary-text underline underline-offset-4 hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              <UserRound className="size-4" aria-hidden /> {reservation.customerName}
            </button>
            <span className="block text-muted-foreground">{reservation.customerPhone}</span>
          </Row>
          {multiSite && <Row k="Site">{site.name}</Row>}
          <Row k="Quand">
            <span className="first-letter:uppercase">{formatDateLong(reservation.date)}</span>, {reservation.lines[0].start} – {reservationEnd(reservation.lines)} <span className="text-muted-foreground">(indicatif)</span>
          </Row>
          <Row k={vocab.Services}>
            <ul className="space-y-1">
              {reservation.lines.map((l) => (
                <li key={l.serviceId}>
                  <span className="font-semibold tabular-nums">{l.start} – {endTime(l.start, l.durationMin)}</span> {brand.services.find((s) => s.id === l.serviceId)?.name}
                  <span className="block text-muted-foreground">
                    {staff.find((p) => p.id === l.practitionerId)?.name ?? "—"}{l.noPreference ? " (sans préférence)" : ""} · {rooms.find((r) => r.id === l.roomId)?.name ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          </Row>
          <Row k="Acompte (FICTIF)">
            <span className="tabular-nums">{formatPrice(reservation.depositAmount)}</span> · {status === "pending_deposit" ? "en attente" : status === "cancelled" ? "—" : "reçu"}
            {status === "pending_deposit" && reservation.holdExpiresAt != null && <HoldInfo expiresAt={reservation.holdExpiresAt} />}
          </Row>
          {reservation.reminderSentAt != null && <Row k="Rappel">Ouvert dans WhatsApp à {hhmm(reservation.reminderSentAt)}</Row>}
        </dl>

        {unavailable.length > 0 && (
          <ul className="space-y-1 text-kv-meta text-muted-foreground" aria-label="Actions indisponibles">
            {unavailable.map(({ to, reason }) => (
              <li key={to} id={`${whyId}-${to}`}>
                {transitionLabel(status, to)} : {reason}
              </li>
            ))}
          </ul>
        )}

        <div aria-live="polite">
          {message && (
            <div className={cn("rounded-lg border px-3 py-2 text-kv-body", message.tone === "ok" ? "border-success bg-success-bg text-success" : "border-destructive bg-danger-bg text-destructive")}>
              <p className="flex gap-2">
                {message.tone === "error" && <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />} {message.text}
              </p>
              {message.conflicts && <ConflictList conflicts={message.conflicts} />}
            </div>
          )}
        </div>

        {canRemind && (
          <p className="text-kv-meta text-muted-foreground">
            {tomorrow ? "Rendez-vous demain : c'est le moment d'envoyer le rappel J-1." : "Message modèle J-1 pré-rempli ; vous l'envoyez vous-même depuis WhatsApp."}
            {reservation.fictive && " Numéro fictif de démonstration."}
          </p>
        )}

        {moving && <MoveForm reservation={reservation} onDone={(text) => { setMoving(false); setMessage({ tone: "ok", text }); }} />}
      </ModalBody>
      <ActionBar primary={primary} secondary={secondary} destructive={cancel ? { ...toAction(cancel), icon: X } : undefined} />
    </>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-3 py-2 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="text-kv-label uppercase text-muted-foreground">{k}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function HoldInfo({ expiresAt }: { expiresAt: number }) {
  const now = useNow(1000);
  if (now === 0) return null;
  const left = remainingMs(expiresAt, now);
  return (
    <span className="mt-1 flex items-center gap-1 text-kv-meta text-muted-foreground">
      <Clock className="size-3.5" aria-hidden /> Expire dans <strong className="font-semibold tabular-nums text-foreground">{formatCountdown(left)}</strong> (délai FICTIF)
    </span>
  );
}

function ConflictList({ conflicts }: { conflicts: Conflict[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {conflicts.map((c, i) => (
        <li key={i} className={cn("flex gap-2 text-kv-body", c.blocking ? "text-destructive" : "text-foreground")}>
          <span aria-hidden>{c.blocking ? "⛔" : "⚠️"}</span>
          <span>
            <span className="sr-only">{c.blocking ? "Conflit bloquant : " : "Avertissement : "}</span>
            {c.message}
            {c.otherReference && <> (réservation {c.otherReference})</>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Déplacement : nouveau jour / heure, praticien et salle par soin ; conflits recalculés à chaque changement. */
function MoveForm({ reservation, onDone }: { reservation: Reservation; onDone: (text: string) => void }) {
  const { today, staff, rooms, planContext, moveReservation } = useAppStore();
  const [date, setDate] = useState(reservation.date);
  const [start, setStart] = useState(reservation.lines[0].start);
  const [assign, setAssign] = useState(reservation.lines.map((l) => ({ practitionerId: l.practitionerId, roomId: l.roomId })));
  const [error, setError] = useState<string | null>(null);
  const uid = useId();

  const siteStaff = staff.filter((p) => (p.siteId ?? reservation.siteId) === reservation.siteId);
  const siteRooms = rooms.filter((r) => (r.siteId ?? reservation.siteId) === reservation.siteId);
  const hours = hoursFor(brand.opening, date);
  const times = useMemo(() => {
    if (!hours) return [];
    const out: string[] = [];
    for (let t = timeToMin(hours.open); t < timeToMin(hours.close); t += brand.opening.slotStepMin) out.push(minToTime(t));
    return out;
  }, [hours]);

  const conflicts = useMemo(
    () => findConflicts(planContext(reservation.siteId), date, buildMovedLines(reservation.lines, { date, start, assignments: assign }), reservation.id),
    [planContext, reservation, date, start, assign],
  );
  const blocked = hasBlocking(conflicts) || !hours;

  const setAssignField = (i: number, key: "practitionerId" | "roomId", value: string) => setAssign((a) => a.map((x, j) => (j === i ? { ...x, [key]: value } : x)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = moveReservation(reservation.id, { date, start, assignments: assign });
    if (!res.ok) return setError(res.reason);
    onDone(`Rendez-vous déplacé au ${formatDateLong(date)} à ${start}.`);
  };

  return (
    <form onSubmit={submit} className="kv-content-fade space-y-4 rounded-lg border bg-muted/50 p-4" aria-label="Déplacer la réservation">
      <h3 className="text-kv-section">Déplacer la réservation</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Jour" htmlFor={`${uid}-date`}>
          <input id={`${uid}-date`} className={fieldControl} type="date" min={today} value={date} onChange={(e) => { setDate(e.target.value); setError(null); }} required />
        </Field>
        <Field label="Heure de début" htmlFor={`${uid}-start`}>
          <select id={`${uid}-start`} className={fieldControl} value={start} onChange={(e) => { setStart(e.target.value); setError(null); }} disabled={!hours}>
            {!times.includes(start) && <option value={start}>{start}</option>}
            {times.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      {reservation.lines.map((l, i) => (
        <fieldset key={l.serviceId} className="grid gap-4 rounded-lg border bg-card p-3 sm:grid-cols-2">
          <legend className="px-1 text-kv-section">{serviceName(l.serviceId)}</legend>
          <Field label={vocab.Practitioner} htmlFor={`${uid}-p-${i}`}>
            <select id={`${uid}-p-${i}`} className={fieldControl} value={assign[i].practitionerId} onChange={(e) => setAssignField(i, "practitionerId", e.target.value)}>
              {siteStaff.map((p) => (
                <option key={p.id} value={p.id}>{p.name}{p.active ? "" : " (inactif)"}</option>
              ))}
            </select>
          </Field>
          <Field label="Salle" htmlFor={`${uid}-r-${i}`}>
            <select id={`${uid}-r-${i}`} className={fieldControl} value={assign[i].roomId} onChange={(e) => setAssignField(i, "roomId", e.target.value)}>
              {siteRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}{r.active ? "" : " (inactive)"}</option>
              ))}
            </select>
          </Field>
        </fieldset>
      ))}
      <div aria-live="polite" data-testid="conflicts">
        {!hours && <p className="text-kv-body text-destructive">Le site est fermé ce jour-là.</p>}
        {conflicts.length === 0 && hours ? <p className="text-kv-body text-success">Aucun conflit : créneau libre.</p> : <ConflictList conflicts={conflicts} />}
        {error && <p role="alert" className="text-kv-body text-destructive">{error}</p>}
      </div>
      <button type="submit" disabled={blocked} className={cn(controlSecondary, "border-primary text-primary-text")}>
        Valider le déplacement
      </button>
    </form>
  );
}
