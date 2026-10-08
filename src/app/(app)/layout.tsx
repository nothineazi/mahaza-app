import type { ReactNode } from "react";
import { AppStoreProvider } from "@/core/state/store";

/**
 * Pages qui lisent l'état de la démo (réservation, back-office). Le store (graines, moteur de planification) n'est chargé que pour
 * ces routes : l'accueil et les pages d'erreur n'en paient pas le poids (RUN-01b, ADR-040). Le store persiste entre
 * /reserver et /admin (même layout) ; il repart des données seed si l'on passe par l'accueil (store transitoire, ADR-030).
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppStoreProvider>{children}</AppStoreProvider>;
}
