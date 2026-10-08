"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Thème clair / sombre piloté par la classe `.dark` sur <html> (next-themes). Défaut : thème du système ; le choix de la
 * personne (bouton du back-office) est mémorisé dans le navigateur.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
