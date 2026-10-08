"use client";

import { createContext, useContext, type ReactNode } from "react";
import { recipientlessLinks, type AppEnv } from "@/lib/runtime";

interface Runtime {
  appEnv: AppEnv;
  /** Vrai hors production : les liens WhatsApp n'ont pas de destinataire. */
  recipientless: boolean;
}

const RuntimeContext = createContext<Runtime>({ appEnv: "development", recipientless: true });

/** Transmet l'environnement lu côté serveur (APP_ENV) aux composants client. */
export function RuntimeProvider({ appEnv, children }: { appEnv: AppEnv; children: ReactNode }) {
  return <RuntimeContext.Provider value={{ appEnv, recipientless: recipientlessLinks(appEnv) }}>{children}</RuntimeContext.Provider>;
}

export function useRuntime(): Runtime {
  return useContext(RuntimeContext);
}
