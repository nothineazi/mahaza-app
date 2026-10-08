import Link from "next/link";
import { brand } from "@/brand/brand.config";
import { cn } from "@/core/lib/utils";

/** Wordmark texte de la marque (aucun fichier image) : pastille « halo » en SVG + nom en police d'affichage. */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 leading-none", className)} aria-label={`${brand.name} — accueil`}>
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden focusable="false">
        <rect width="32" height="32" rx="8" className="fill-primary" />
        <circle cx="16" cy="16" r="7.5" fill="none" strokeWidth="3" className="stroke-primary-foreground" />
        <path d="M8.5 16a7.5 7.5 0 0 1 15 0" fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-accent" />
      </svg>
      <span className="flex flex-col">
        <span className="font-heading text-2xl font-semibold tracking-[0.18em] text-foreground">{brand.logoText}</span>
        <span className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{brand.tagline}</span>
      </span>
    </Link>
  );
}
