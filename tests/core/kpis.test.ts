import { describe, expect, it } from "vitest";
import { brand } from "@/brand/brand.config";
import { estimatedRevenue, estimatedServiceValue, occupancyRate, pendingDeposits, periodDays, remindersDue, upcoming, weekBreakdown, type KpiContext } from "@/core/booking/kpis";
import { NOW_MS, policies, reservation, seedAll, SITE, TODAY } from "./fixtures";

const staff = brand.practitioners.filter((p) => p.siteId === SITE);
const ctxOf = (reservations: ReturnType<typeof seedAll>): KpiContext => ({
  reservations, staff, services: brand.services, opening: brand.opening, policies, today: TODAY, nowMs: NOW_MS,
});
const line = (start: string, serviceId = "vi-soin-lumiere") => ({ serviceId, practitionerId: `${SITE}-p1`, roomId: `${SITE}-r-visage`, start, durationMin: 60, noPreference: false });

describe("KPIs du tableau de bord (FICTIF)", () => {
  it("taux de remplissage : minutes réservées / (ouverture × praticiens actifs)", () => {
    // mercredi : 9h-19h = 600 min × 5 praticiens = 3000 ; 2 soins de 60 min = 120
    const list = [reservation({ id: "1", date: TODAY, lines: [line("10:00")] }), reservation({ id: "2", date: TODAY, status: "pending_deposit", lines: [line("14:00")] })];
    expect(occupancyRate(ctxOf(list), [TODAY])).toBeCloseTo(120 / 3000, 5);
    // annulées et no-show ne comptent pas
    const cancelled = [reservation({ id: "1", date: TODAY, status: "cancelled", lines: [line("10:00")] }), reservation({ id: "2", date: TODAY, status: "no_show", lines: [line("12:00")] })];
    expect(occupancyRate(ctxOf(cancelled), [TODAY])).toBe(0);
    expect(occupancyRate({ ...ctxOf([]), staff: [] }, [TODAY])).toBeNull();
  });

  it("CA estimé : confirmées + terminées, prix du soin (FICTIF) ; à défaut, barème fictif par catégorie", () => {
    const list = [
      reservation({ id: "1", date: TODAY, lines: [line("10:00"), line("11:00", "mp-manucure-complete")] }),
      reservation({ id: "2", date: TODAY, status: "pending_deposit", lines: [line("14:00")] }),
      reservation({ id: "3", date: TODAY, status: "completed", lines: [line("15:00")] }),
    ];
    const price = (id: string) => brand.services.find((s) => s.id === id)!.price!;
    expect(estimatedRevenue(ctxOf(list), [TODAY])).toBe(2 * price("vi-soin-lumiere") + price("mp-manucure-complete"));
    expect(estimatedServiceValue({ id: "x", name: "x", category: "Soins du visage", price: 1234 }, policies)).toBe(1234);
    expect(estimatedServiceValue({ id: "y", name: "y", category: "Soins du visage" }, policies)).toBe(policies.fictivePriceByCategory["Soins du visage"]);
    expect(estimatedServiceValue(undefined, policies)).toBe(0);
  });

  it("acomptes en attente : nombre, montant, prochaine échéance", () => {
    const list = [
      reservation({ id: "1", status: "pending_deposit", holdExpiresAt: NOW_MS + 600_000, depositAmount: 5000, lines: [line("10:00")] }),
      reservation({ id: "2", status: "pending_deposit", holdExpiresAt: NOW_MS + 300_000, depositAmount: 5000, lines: [line("11:00")] }),
      reservation({ id: "3", status: "confirmed", lines: [line("12:00")] }),
    ];
    expect(pendingDeposits(list)).toEqual({ count: 2, amount: 10000, nextExpiry: NOW_MS + 300_000 });
    expect(pendingDeposits([])).toEqual({ count: 0, amount: 0, nextExpiry: null });
  });

  it("rappels J-1 : seulement demain, confirmées ou en attente, triées", () => {
    const list = [
      reservation({ id: "1", date: "2026-10-08", lines: [line("15:00")] }),
      reservation({ id: "2", date: "2026-10-08", status: "pending_deposit", lines: [line("09:00")] }),
      reservation({ id: "3", date: "2026-10-08", status: "cancelled", lines: [line("10:00")] }),
      reservation({ id: "4", date: "2026-10-09", lines: [line("10:00")] }),
    ];
    expect(remindersDue(list, TODAY).map((r) => r.id)).toEqual(["2", "1"]);
  });

  it("sur les données seed : cohérence jour / semaine", () => {
    const all = seedAll().filter((r) => r.siteId === SITE);
    const ctx = ctxOf(all);
    const week = periodDays("week", TODAY);
    expect(week).toHaveLength(7);
    expect(week[0]).toBe("2026-10-05");
    const bd = weekBreakdown(ctx);
    expect(bd.reduce((s, d) => s + d.count, 0)).toBe(all.filter((r) => week.includes(r.date) && r.status !== "cancelled").length);
    expect(bd.reduce((s, d) => s + d.revenue, 0)).toBe(estimatedRevenue(ctx, week));
    expect(upcoming(all, TODAY, 0).every((r) => r.date >= TODAY)).toBe(true);
  });
});
