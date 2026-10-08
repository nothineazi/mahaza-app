import Link from "next/link";
import { brand } from "@/brand/brand.config";
import { Button } from "@/ui/primitives/button";
import { HeroImages } from "@/ui/home/hero-images";

/** Hero : texte et boutons rendus par le serveur ; seules les images alternent côté client (voir `HeroImages`). */
export function HeroCarousel() {
  const home = brand.home;
  if (!home) return null;

  return (
    <section className="relative isolate overflow-hidden bg-inverse" aria-roledescription="carrousel" aria-label="Illustrations">
      <HeroImages images={home.heroImages.map(({ src, alt }) => ({ src, alt }))} />
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-inverse/92 via-inverse/90 to-inverse/88" aria-hidden />

      <div className="mx-auto flex min-h-[560px] max-w-6xl flex-col items-start justify-center gap-7 px-4 py-20 text-inverse-foreground sm:min-h-[640px] sm:px-6">
        <p className="lux-fade-up text-xs font-semibold uppercase tracking-[0.32em] text-gold sm:text-sm">{home.heroKicker}</p>
        <h1 className="lux-fade-up max-w-3xl font-display text-5xl font-medium leading-[1.05] [animation-delay:80ms] sm:text-7xl sm:leading-none">{home.heroTitle}</h1>
        <p className="lux-fade-up max-w-xl text-lg leading-relaxed text-inverse-foreground/90 [animation-delay:160ms]">{brand.description}</p>
        <div className="lux-fade-up flex flex-wrap gap-3 [animation-delay:240ms]">
          <Button asChild variant="gold" size="lg">
            <Link href="/reserver">Prendre rendez-vous</Link>
          </Button>
          <Button asChild variant="outline-light" size="lg">
            <Link href="/#soins">Découvrir nos soins</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
