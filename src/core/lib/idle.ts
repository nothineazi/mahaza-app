/**
 * Exécute `fn` quand le navigateur est au repos (`requestIdleCallback`, repli sur un délai : Safari ne le fournit pas).
 * Renvoie la fonction d'annulation, à retourner d'un effet React.
 */
export function whenIdle(fn: () => void, { timeout = 3000, fallbackMs = 1500 }: { timeout?: number; fallbackMs?: number } = {}): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(fn, fallbackMs);
  return () => window.clearTimeout(id);
}
