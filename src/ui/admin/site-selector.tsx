"use client";

import { useId } from "react";
import { useAppStore } from "@/core/state/store";
import { getSite, multiSite, sites } from "@/core/sites/sites";
import { Field } from "@/ui/kv/field";
import { fieldControl } from "@/ui/kv/control-classes";

/** Sélecteur de site du back-office : filtre tableau de bord, planning, réservations, clients, salles et staff. */
export function AdminSiteSelector() {
  const { adminSiteId, setAdminSiteId } = useAppStore();
  const id = useId();
  if (!multiSite) return null;
  return (
    <Field label="Site" htmlFor={id} hint={getSite(adminSiteId).address}>
      <select id={id} value={adminSiteId} onChange={(e) => setAdminSiteId(e.target.value)} className={fieldControl}>
        {sites.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </Field>
  );
}
