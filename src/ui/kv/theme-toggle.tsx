"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/core/lib/utils";
import { controlIcon } from "@/ui/kv/control-classes";

/**
 * Bouton clair / sombre du back-office. Les deux icônes sont rendues et alternées en CSS (`dark:`) : aucun état côté client,
 * donc pas de décalage à l'hydratation. Le choix explicite est mémorisé ; sans choix, le thème du système s'applique.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Basculer entre le thème clair et le thème sombre" title="Thème clair / sombre" className={cn(controlIcon, className)}>
      <Moon className="dark:hidden" aria-hidden />
      <Sun className="hidden dark:block" aria-hidden />
    </button>
  );
}
