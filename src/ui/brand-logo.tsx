import Link from "next/link";
import { brand } from "@/brand/brand.config";
import { cn } from "@/core/lib/utils";

/* Le logo est une petite image statique de `public/brand/` : un `<img>` simple (dimensions explicites, pas de CLS) évite d'embarquer le code client de `next/image`
   (+ 5 kB gzip sur /reserver, budget ADR-040). */
/* eslint-disable @next/next/no-img-element */

/**
 * Logo de la marque. Trois formes, selon `brand.logoImage` / `brand.logoMark` :
 * logo complet (image, posé sur une plaque claire en thème sombre) ; pastille image + wordmark texte ; pastille SVG par défaut + wordmark texte.
 */
export function BrandLogo({ className, compact }: { className?: string; compact?: boolean }) {
  const { logoImage, logoMark } = brand;
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 leading-none", className)} aria-label={`${brand.name} — accueil`}>
      {logoImage ? (
        <img
          src={logoImage.src}
          alt=""
          width={logoImage.width}
          height={logoImage.height}
          className="h-10 w-auto shrink-0 rounded-md dark:bg-white/95 dark:px-2 dark:py-1"
        />
      ) : (
        <>
          {logoMark ? (
            <img src={logoMark.src} alt="" width={logoMark.width} height={logoMark.height} className="size-8 shrink-0" />
          ) : (
            <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden focusable="false">
              <rect width="32" height="32" rx="8" className="fill-primary" />
              <circle cx="16" cy="16" r="7.5" fill="none" strokeWidth="3" className="stroke-primary-foreground" />
              <path d="M8.5 16a7.5 7.5 0 0 1 15 0" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-gold" />
            </svg>
          )}
          <span className="flex flex-col">
            <span className="font-display text-2xl font-semibold tracking-[0.18em] text-foreground">{brand.logoText}</span>
            {!compact && <span className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{brand.tagline}</span>}
          </span>
        </>
      )}
    </Link>
  );
}
