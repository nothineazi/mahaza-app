import type { Client, Practitioner, Reservation, Room } from "@/core/types";

/**
 * Persistance de l'état de la démo (ADR-041) : un instantané JSON dans `sessionStorage`, avec repli en mémoire quand le stockage est
 * indisponible (navigation privée, stockage bloqué, quota). Tout accès est enveloppé : rien ne doit jamais faire échouer l'interface.
 * Aucune donnée ne quitte le navigateur. L'instantané est lié à un jour : le lendemain, les dates relatives du seed ont changé, on repart du seed.
 */
export const SNAPSHOT_VERSION = 1;

export interface DemoSnapshot {
  v: typeof SNAPSHOT_VERSION;
  /** Jour (ISO, `YYYY-MM-DD`) pour lequel l'état a été produit. */
  day: string;
  reservations: Reservation[];
  clients: Client[];
  rooms: Room[];
  staff: Practitioner[];
  adminSiteId: string;
}

/** Le sous-ensemble de `Storage` dont on a besoin (permet de tester sans navigateur). */
export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Dernier instantané, conservé en mémoire du module : survit à une navigation interne même sans `sessionStorage`. */
let memory: { key: string; json: string } | null = null;

const browserStorage = (): StorageLike | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null; // l'accès à `window.sessionStorage` peut lui-même lever une exception
  }
};

const isSnapshot = (x: unknown, day: string): x is DemoSnapshot => {
  if (typeof x !== "object" || x === null) return false;
  const s = x as Record<string, unknown>;
  return (
    s.v === SNAPSHOT_VERSION &&
    s.day === day &&
    typeof s.adminSiteId === "string" &&
    Array.isArray(s.reservations) &&
    Array.isArray(s.clients) &&
    Array.isArray(s.rooms) &&
    Array.isArray(s.staff)
  );
};

/** Lit l'instantané du jour, ou `null` (absent, périmé, d'une autre version, corrompu). */
export function loadSnapshot(key: string, day: string, storage: StorageLike | null = browserStorage()): DemoSnapshot | null {
  let json: string | null = null;
  try {
    json = storage?.getItem(key) ?? null;
  } catch {
    json = null;
  }
  if (json === null && memory?.key === key) json = memory.json;
  if (json === null) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    return isSnapshot(parsed, day) ? parsed : null;
  } catch {
    return null;
  }
}

/** Écrit l'instantané (stockage du navigateur puis repli en mémoire). Ne lève jamais d'exception. */
export function saveSnapshot(key: string, snapshot: DemoSnapshot, storage: StorageLike | null = browserStorage()): void {
  let json: string;
  try {
    json = JSON.stringify(snapshot);
  } catch {
    return;
  }
  memory = { key, json };
  try {
    storage?.setItem(key, json);
  } catch {
    // quota dépassé ou stockage bloqué : le repli en mémoire suffit pour la navigation interne
  }
}

/** Efface l'instantané (bouton « Réinitialiser la démo »). */
export function clearSnapshot(key: string, storage: StorageLike | null = browserStorage()): void {
  if (memory?.key === key) memory = null;
  try {
    storage?.removeItem(key);
  } catch {
    // sans effet
  }
}
