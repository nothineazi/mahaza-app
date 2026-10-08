import { brand } from "@/brand/brand.config";
import { LazyGiftCardStudio } from "@/ui/home/lazy-gift-card";
import { SectionTitle } from "@/ui/primitives/section-title";
import { Skeleton } from "@/ui/primitives/skeleton";

/**
 * Section « cartes cadeaux » de l'accueil. Le titre et le texte sont rendus côté serveur ; le studio (formulaire, aperçu, code, lien
 * WhatsApp) n'est téléchargé que lorsque la section approche de l'écran (RUN-01b, ADR-040). Le gabarit de remplacement a les
 * mêmes colonnes et les mêmes hauteurs minimales : aucun décalage visible au chargement.
 */
export function GiftCardSection() {
  const gift = brand.home?.gift;
  if (!gift) return null;
  return (
    <section id="cartes-cadeaux" className="scroll-mt-20 bg-secondary">
      <LazyGiftCardStudio
        fallback={
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-start">
            <div className="space-y-8">
              <SectionTitle kicker="Offrir un moment" title={gift.title} lead={gift.text} />
              <Skeleton className="h-[778px] sm:h-[618px] lg:h-[580px]" />
            </div>
            <div className="order-first space-y-5 lg:order-0">
              <Skeleton className="aspect-8/5 w-full rounded-3xl" />
            </div>
          </div>
        }
      />
    </section>
  );
}
