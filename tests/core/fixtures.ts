import { brand } from "@/brand/brand.config";
import { demoClients, demoReservations } from "@/brand/seed/demo";
import { buildSeedReservations } from "@/core/booking/seed";
import type { PlanContext } from "@/core/booking/scheduling";
import type { Reservation } from "@/core/types";

/** Mercredi 7 octobre 2026 ; lundi de la semaine = 5 octobre. */
export const TODAY = "2026-10-07";
export const NOW_MS = Date.UTC(2026, 9, 7, 8, 0);
export const SITE = "site-aurore";

export const policies = brand.policies;

export function seedAll(): Reservation[] {
  return buildSeedReservations(
    {
      demo: demoReservations,
      services: brand.services,
      defaultDurationMin: brand.defaultDurationMin ?? 60,
      referencePrefix: brand.referencePrefix,
      depositFor: () => 5000,
      today: TODAY,
      nowMs: NOW_MS,
      seedHoldMin: policies.seedHoldMin,
    },
    demoClients,
  );
}

export function ctxFor(reservations: Reservation[], siteId = SITE, nowMin = 8 * 60): PlanContext {
  return {
    siteId,
    services: brand.services,
    staff: brand.practitioners,
    rooms: brand.rooms,
    reservations,
    opening: brand.opening,
    defaultDurationMin: brand.defaultDurationMin ?? 60,
    today: TODAY,
    nowMin,
  };
}

export function reservation(partial: Partial<Reservation> & Pick<Reservation, "lines">): Reservation {
  return {
    id: "t1",
    reference: "OVG-T001",
    siteId: SITE,
    clientId: "c-test",
    customerName: "Test Client",
    customerPhone: "+237 600 00 00 99",
    date: "2026-10-12",
    createdAt: NOW_MS,
    holdExpiresAt: null,
    status: "confirmed",
    depositAmount: 5000,
    source: "web",
    ...partial,
  };
}
