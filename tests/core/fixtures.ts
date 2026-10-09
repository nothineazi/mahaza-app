import { demoClients, demoReservations } from "./fixture-brand/demo";
import { seedPractitioners, seedRooms, seedServices, seedSites } from "./fixture-brand/catalog";
import { buildSeedReservations } from "@/core/booking/seed";
import type { PlanContext } from "@/core/booking/scheduling";
import type { Reservation } from "@/core/types";

/** Mercredi 7 octobre 2026 ; lundi de la semaine = 5 octobre. */
export const TODAY = "2026-10-07";
export const NOW_MS = Date.UTC(2026, 9, 7, 8, 0);
export const SITE = "site-aurore";

/**
 * Marque de TEST : jeu de données figé (`./fixture-brand`), indépendant de `src/brand/` pour que les tests du socle restent
 * valables dans chaque dépôt client (qui remplace la marque, ses sites, son catalogue et ses horaires).
 */
export const brand = {
  name: "MARQUE-TEST",
  referencePrefix: "TST",
  sites: seedSites,
  services: seedServices,
  practitioners: seedPractitioners,
  rooms: seedRooms,
  defaultDurationMin: 60,
  opening: { open: "09:00", close: "19:00", closedDays: [] as number[], slotStepMin: 30, byDay: { 6: { open: "09:00", close: "18:00" }, 0: { open: "10:00", close: "16:00" } } },
  policies: {
    depositHoldMin: 30,
    maxCartItems: 5,
    seedHoldMin: 360,
    loyalty: { pointsPerVisit: 10, tiers: [{ label: "Découverte", minPoints: 0 }, { label: "Argent", minPoints: 30 }, { label: "Or", minPoints: 60 }] },
    fictivePriceByCategory: { "Soins du visage": 18000, "Soins du corps": 25000, "Mains et pieds": 10000, "Coiffure": 20000, "Barbier": 6000 },
    giftCard: { minAmount: 10000, maxAmount: 100000, stepAmount: 5000, messageMax: 200 },
  },
};
export const testClients = demoClients;
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
    reference: "TST-T001",
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
