"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

/**
 * Charge un composant seulement quand son emplacement approche de l'écran (IntersectionObserver, marge de 600 px) : son JS
 * n'est pas téléchargé avant. Le gabarit `fallback` est rendu par le serveur ; sans IntersectionObserver, on charge tout de suite.
 * Si le téléchargement échoue (réseau instable), un message dit quoi faire au lieu d'un gabarit qui ne finit jamais de charger.
 */
export function LazyOnVisible({ load, fallback }: { load: () => Promise<ComponentType>; fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const run = () =>
      load().then(
        (C) => !cancelled && setComponent(() => C),
        () => !cancelled && setFailed(true),
      );
    if (typeof IntersectionObserver === "undefined") {
      void run();
      return () => {
        cancelled = true;
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void run();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [load]);

  return (
    <div ref={ref}>
      {Component ? <Component /> : fallback}
      {failed && !Component && (
        <p role="alert" className="mx-auto max-w-6xl px-4 pb-8 text-sm text-destructive sm:px-6">
          Cette section n&apos;a pas pu se charger (réseau instable ?). Rechargez la page pour la voir.
        </p>
      )}
    </div>
  );
}
