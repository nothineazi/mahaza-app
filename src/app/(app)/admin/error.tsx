"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { controlPrimary } from "@/ui/kv/control-classes";
import { Panel } from "@/ui/kv/panel";
import { StateBlock } from "@/ui/kv/state-block";

/** Erreur inattendue dans un écran du back-office : dit ce qui s'est passé et propose de réessayer (Next 16 : `retry`). */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Le message technique reste dans la console du navigateur ; l'écran n'affiche aucun détail interne.
    console.error(error);
  }, [error]);
  return (
    <Panel>
      <StateBlock
        tone="error"
        icon={TriangleAlert}
        title="Cet écran n'a pas pu s'afficher"
        text="Une erreur inattendue s'est produite. Vos données n'ont pas été modifiées : réessayez, et rechargez la page si l'erreur revient."
        action={
          <button type="button" onClick={() => retry()} className={controlPrimary}>
            Réessayer
          </button>
        }
      />
    </Panel>
  );
}
