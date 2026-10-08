"use client";

import { useId, useState } from "react";
import { Pencil, Plus, UserRound } from "lucide-react";
import { brand } from "@/brand/brand.config";
import type { Practitioner } from "@/core/types";
import { useAdminData } from "@/core/state/store";
import { toggle } from "@/ui/admin/helpers";
import { ActionBar } from "@/ui/kv/action-bar";
import { DeleteConfirm } from "@/ui/kv/delete-confirm";
import { controlPrimary, controlSecondary, fieldControl } from "@/ui/kv/control-classes";
import { Field } from "@/ui/kv/field";
import { FictiveTag } from "@/ui/kv/fictive-tag";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@/ui/kv/modal";
import { PageHeader } from "@/ui/kv/page-header";
import { Panel } from "@/ui/kv/panel";
import { LoadingRegion, Skeleton } from "@/ui/kv/skeleton";
import { StateBlock } from "@/ui/kv/state-block";
import { StatusBadge } from "@/ui/kv/status-badge";
import { LabeledSwitch } from "@/ui/kv/switch";

export function StaffManager() {
  const { ready, staff, reservations, saveStaff, removeStaff, newId, siteId, site } = useAdminData();
  const [editing, setEditing] = useState<Practitioner | null>(null);

  if (!ready) {
    return (
      <LoadingRegion label="Chargement de l'équipe" className="space-y-6">
        <Skeleton className="h-[52px] w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-[176px]" />
          <Skeleton className="h-[176px]" />
        </div>
      </LoadingRegion>
    );
  }

  const startNew = () => setEditing({ id: "", name: "", role: "", serviceIds: [], active: true, siteId });
  const usage = (id: string) => reservations.filter((r) => r.lines.some((l) => l.practitionerId === id)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff"
        subtitle={site.name}
        action={
          <button type="button" onClick={startNew} className={controlPrimary}>
            <Plus aria-hidden /> Ajouter un praticien
          </button>
        }
      />

      {staff.length === 0 ? (
        <Panel>
          <StateBlock
            icon={UserRound}
            title="Aucun praticien"
            text="Ajoutez-en un pour ouvrir des créneaux à la réservation."
            action={
              <button type="button" onClick={startNew} className={controlSecondary}>
                <Plus aria-hidden /> Ajouter un praticien
              </button>
            }
          />
        </Panel>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {staff.map((p) => (
            <li key={p.id}>
              <Panel className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xl font-semibold text-secondary-foreground">{p.name.charAt(0)}</span>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-kv-section">
                        {p.name}
                        {p.fictive && <FictiveTag />}
                      </p>
                      <p className="text-kv-meta text-muted-foreground">{p.role}</p>
                    </div>
                  </div>
                  <StatusBadge tone={p.active ? "success" : "neutral"}>{p.active ? "Actif" : "Inactif"}</StatusBadge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.serviceIds.slice(0, 6).map((id) => (
                    <StatusBadge key={id} tone="completed">{brand.services.find((s) => s.id === id)?.name ?? id}</StatusBadge>
                  ))}
                  {p.serviceIds.length > 6 && <StatusBadge tone="neutral">+{p.serviceIds.length - 6}</StatusBadge>}
                  {p.serviceIds.length === 0 && <span className="text-kv-meta text-muted-foreground">Aucun soin assigné</span>}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <LabeledSwitch id={`staff-${p.id}`} label="Réservable" checked={p.active} onCheckedChange={(v) => saveStaff({ ...p, active: v })} />
                  <button type="button" onClick={() => setEditing(p)} className={controlSecondary}>
                    <Pencil aria-hidden /> Modifier<span className="sr-only"> {p.name}</span>
                  </button>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <ModalContent>
          {editing && (
            <StaffForm
              key={editing.id || "new"}
              initial={editing}
              isNew={editing.id === ""}
              usedBy={usage(editing.id)}
              onClose={() => setEditing(null)}
              onSave={(member) => {
                saveStaff(member.id ? member : { ...member, id: newId("p") });
                setEditing(null);
              }}
              onDelete={(id) => {
                removeStaff(id);
                setEditing(null);
              }}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

interface FormProps {
  initial: Practitioner;
  isNew: boolean;
  usedBy: number;
  onClose: () => void;
  onSave: (member: Practitioner) => void;
  onDelete: (id: string) => void;
}

function StaffForm({ initial, isNew, usedBy, onSave, onDelete, onClose }: FormProps) {
  const [form, setForm] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const valid = form.name.trim().length > 0 && form.role.trim().length > 0;
  const formId = useId();

  return (
    <>
      <ModalHeader title={isNew ? "Nouveau praticien" : `Modifier « ${initial.name} »`} description="Un praticien n'est proposé que pour les soins cochés." />
      <ModalBody>
        <form
          id={formId}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onSave({ ...form, name: form.name.trim(), role: form.role.trim() });
          }}
        >
          <Field label="Nom" htmlFor={`${formId}-name`} required>
            <input id={`${formId}-name`} className={fieldControl} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Fonction" htmlFor={`${formId}-role`} required>
            <input id={`${formId}-role`} className={fieldControl} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          </Field>
          <fieldset className="space-y-4">
            <legend className="mb-1 text-kv-label uppercase text-muted-foreground">Soins assurés</legend>
            {brand.categories.map((category) => (
              <div key={category} className="space-y-1">
                <p className="text-kv-section text-primary-text">{category}</p>
                {brand.services
                  .filter((s) => s.category === category)
                  .map((s) => (
                    <label key={s.id} className="flex h-11 items-center gap-2 text-kv-body md:h-8">
                      <input type="checkbox" className="size-4 accent-primary" checked={form.serviceIds.includes(s.id)} onChange={() => setForm({ ...form, serviceIds: toggle(form.serviceIds, s.id) })} />
                      {s.name}
                    </label>
                  ))}
              </div>
            ))}
          </fieldset>
        </form>
        {confirmDelete && <DeleteConfirm name={initial.name} onConfirm={() => onDelete(initial.id)} onCancel={() => setConfirmDelete(false)} />}
        {!isNew && usedBy > 0 && <p className="text-kv-meta text-muted-foreground">Suppression impossible : {usedBy} réservation(s) liée(s). Désactivez le praticien à la place.</p>}
      </ModalBody>
      <ActionBar
        primary={{ label: "Enregistrer", submitForm: formId, disabled: !valid }}
        secondary={[{ label: "Annuler", onClick: onClose }]}
        destructive={!isNew && usedBy === 0 ? { label: "Supprimer", onClick: () => setConfirmDelete(true) } : undefined}
      />
    </>
  );
}
