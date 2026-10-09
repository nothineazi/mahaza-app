"use client";

import { useId, useState } from "react";
import { DoorOpen, Pencil, Plus } from "lucide-react";
import { brand } from "@/brand/brand.config";
import type { Room } from "@/core/types";
import { useAdminData } from "@/core/state/store";
import { toggle } from "@/ui/admin/helpers";
import { ActionBar } from "@/ui/kv/action-bar";
import { DeleteConfirm } from "@/ui/kv/delete-confirm";
import { controlPrimary, controlSecondary, fieldControl, textareaControl } from "@/ui/kv/control-classes";
import { Field } from "@/ui/kv/field";
import { FictiveTag } from "@/ui/kv/fictive-tag";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@/ui/kv/modal";
import { PageHeader } from "@/ui/kv/page-header";
import { Panel } from "@/ui/kv/panel";
import { LoadingRegion, Skeleton } from "@/ui/kv/skeleton";
import { StateBlock } from "@/ui/kv/state-block";
import { StatusBadge } from "@/ui/kv/status-badge";
import { LabeledSwitch } from "@/ui/kv/switch";
import { vocab } from "@/brand/copy/vocab";

export function RoomsManager() {
  const { ready, rooms, reservations, saveRoom, removeRoom, newId, siteId, site } = useAdminData();
  const [editing, setEditing] = useState<Room | null>(null);

  if (!ready) {
    return (
      <LoadingRegion label="Chargement des salles" className="space-y-6">
        <Skeleton className="h-[52px] w-64" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-[176px]" />
          <Skeleton className="h-[176px]" />
        </div>
      </LoadingRegion>
    );
  }

  const startNew = () => setEditing({ id: "", name: "", description: "", categories: [], active: true, siteId });
  const usage = (id: string) => reservations.filter((r) => r.lines.some((l) => l.roomId === id)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salles"
        subtitle={site.name}
        action={
          <button type="button" onClick={startNew} className={controlPrimary}>
            <Plus aria-hidden /> Ajouter une salle
          </button>
        }
      />

      {rooms.length === 0 ? (
        <Panel>
          <StateBlock
            icon={DoorOpen}
            title="Aucune salle"
            text="Ajoutez-en une pour ouvrir des créneaux à la réservation."
            action={
              <button type="button" onClick={startNew} className={controlSecondary}>
                <Plus aria-hidden /> Ajouter une salle
              </button>
            }
          />
        </Panel>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <li key={room.id}>
              <Panel className="flex h-full flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-kv-section">
                      {room.name}
                      {room.fictive && <FictiveTag />}
                    </p>
                    <p className="text-kv-meta text-muted-foreground">{room.description}</p>
                  </div>
                  <StatusBadge tone={room.active ? "success" : "neutral"}>{room.active ? "Active" : "Inactive"}</StatusBadge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.categories.map((c) => (
                    <StatusBadge key={c} tone="completed">{c}</StatusBadge>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <LabeledSwitch id={`room-${room.id}`} label="Réservable" checked={room.active} onCheckedChange={(v) => saveRoom({ ...room, active: v })} />
                  <button type="button" onClick={() => setEditing(room)} className={controlSecondary}>
                    <Pencil aria-hidden /> Modifier<span className="sr-only"> {room.name}</span>
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
            <RoomForm
              key={editing.id || "new"}
              initial={editing}
              isNew={editing.id === ""}
              usedBy={usage(editing.id)}
              onClose={() => setEditing(null)}
              onSave={(room) => {
                saveRoom(room.id ? room : { ...room, id: newId("r") });
                setEditing(null);
              }}
              onDelete={(id) => {
                removeRoom(id);
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
  initial: Room;
  isNew: boolean;
  usedBy: number;
  onClose: () => void;
  onSave: (room: Room) => void;
  onDelete: (id: string) => void;
}

function RoomForm({ initial, isNew, usedBy, onSave, onDelete, onClose }: FormProps) {
  const [form, setForm] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const valid = form.name.trim().length > 0 && form.categories.length > 0;
  const formId = useId();

  return (
    <>
      <ModalHeader title={isNew ? "Nouvelle salle" : `Modifier « ${initial.name} »`} description={`Une salle n'accueille que les ${vocab.services} des catégories cochées.`} />
      <ModalBody>
        <form
          id={formId}
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onSave({ ...form, name: form.name.trim(), description: form.description.trim() });
          }}
        >
          <Field label="Nom" htmlFor={`${formId}-name`} required>
            <input id={`${formId}-name`} className={fieldControl} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Description" htmlFor={`${formId}-desc`}>
            <textarea id={`${formId}-desc`} className={textareaControl} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <fieldset className="space-y-1">
            <legend className="mb-1 text-kv-label uppercase text-muted-foreground">Catégories de {vocab.services}</legend>
            {brand.categories.map((c) => (
              <label key={c} className="flex h-11 items-center gap-2 text-kv-body md:h-8">
                <input type="checkbox" className="size-4 accent-primary" checked={form.categories.includes(c)} onChange={() => setForm({ ...form, categories: toggle(form.categories, c) })} />
                {c}
              </label>
            ))}
            {form.categories.length === 0 && <p role="alert" className="text-kv-meta text-destructive">Cochez au moins une catégorie.</p>}
          </fieldset>
        </form>
        {confirmDelete && <DeleteConfirm name={initial.name} onConfirm={() => onDelete(initial.id)} onCancel={() => setConfirmDelete(false)} />}
        {!isNew && usedBy > 0 && <p className="text-kv-meta text-muted-foreground">Suppression impossible : {usedBy} réservation(s) liée(s). Désactivez la salle à la place.</p>}
      </ModalBody>
      <ActionBar
        primary={{ label: "Enregistrer", submitForm: formId, disabled: !valid }}
        secondary={[{ label: "Annuler", onClick: onClose }]}
        destructive={!isNew && usedBy === 0 ? { label: "Supprimer", onClick: () => setConfirmDelete(true) } : undefined}
      />
    </>
  );
}
