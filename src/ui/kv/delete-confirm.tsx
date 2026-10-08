import { controlDanger, controlGhost } from "@/ui/kv/control-classes";

/** Confirmation d'une suppression définitive (l'action destructive passe d'abord par le menu de la barre d'actions). */
export function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div role="alert" className="space-y-2 rounded-lg border border-destructive bg-danger-bg p-3 text-kv-body text-destructive">
      <p>Supprimer définitivement « {name} » ? Cette action est irréversible (en mémoire, démo).</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onConfirm} className={controlDanger}>
          Confirmer la suppression
        </button>
        <button type="button" onClick={onCancel} className={controlGhost}>
          Annuler
        </button>
      </div>
    </div>
  );
}
