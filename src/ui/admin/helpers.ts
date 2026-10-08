/** Ajoute la valeur si absente, la retire sinon. */
export function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

import { brand } from "@/brand/brand.config";
import type { Reservation } from "@/core/types";

/** Noms des soins d'une réservation, séparés par « + ». */
export const serviceNames = (r: Reservation) => r.lines.map((l) => brand.services.find((s) => s.id === l.serviceId)?.name).join(" + ");

/** Noms (sans doublon) des praticiens d'une réservation. */
export const staffNames = (r: Reservation, staff: { id: string; name: string }[]) =>
  [...new Set(r.lines.map((l) => l.practitionerId))].map((id) => staff.find((p) => p.id === id)?.name ?? "—").join(", ");
