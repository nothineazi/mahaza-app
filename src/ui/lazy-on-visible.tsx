"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";

/**
 * Charge un composant seulement quand son emplacement approche de l'écran (IntersectionObserver, marge de 600 px) : son JS
 * n'est pas téléchargé avant. Le gabarit `fallback` est rendu par le serveur ; sans IntersectionObserver, on charge tout de suite.
 */
export function LazyOnVisible({ load, fallback }: { load: () => Promise<ComponentType>; fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- navigateur sans IntersectionObserver : chargement immédiat
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    load().then((C) => {
      if (!cancelled) setComponent(() => C);
    });
    return () => {
      cancelled = true;
    };
    // `load` est une constante du module appelant (import dynamique) : une seule exécution suffit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near]);

  return <div ref={ref}>{Component ? <Component /> : fallback}</div>;
}
