"use client";

import { useEffect } from "react";

/**
 * Erreur dans le tunnel de réservation (ex. étape non téléchargée sur un réseau instable) : explique et propose de réessayer.
 * Volontairement sans en-tête, pied de page ni primitives : ce fichier fait partie du First Load JS de `/reserver` (ADR-040).
 */
export default function ReserverError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="contenu" className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 role="alert" className="font-display text-3xl font-medium">Cette étape n&apos;a pas pu se charger</h1>
      <p className="text-muted-foreground">La connexion semble instable. Votre réservation n&apos;a pas été envoyée : réessayez, et rechargez la page si le problème continue.</p>
      <button type="button" onClick={() => retry()} className="min-h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Réessayer
      </button>
    </main>
  );
}
