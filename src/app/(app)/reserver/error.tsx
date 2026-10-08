"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/ui/primitives/button";
import { SiteFooter } from "@/ui/site/site-footer";
import { SiteHeader } from "@/ui/site/site-header";

/** Erreur dans le tunnel de réservation (ex. étape non téléchargée sur un réseau instable) : explique et propose de réessayer. */
export default function ReserverError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <>
      <SiteHeader />
      <main id="contenu" className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <TriangleAlert className="size-8 text-destructive" aria-hidden />
        <h1 role="alert" className="font-display text-3xl font-medium">Cette étape n&apos;a pas pu se charger</h1>
        <p className="text-muted-foreground">La connexion semble instable. Votre réservation n&apos;a pas été envoyée : réessayez, et rechargez la page si le problème continue.</p>
        <Button onClick={() => retry()}>Réessayer</Button>
      </main>
      <SiteFooter />
    </>
  );
}
