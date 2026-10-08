import type { HomeContent } from "@/core/types";

/**
 * Textes et visuels de l'accueil d'OVAGLOW (marque FICTIVE). Les images sont des illustrations SVG générées
 * (`npm run assets:generate`), servies depuis `public/brand/`. Un dépôt client remplace ce fichier.
 */
export const homeCopy: HomeContent = {
  heroKicker: "Marque fictive de démonstration",
  heroTitle: "Bienvenue chez OVAGLOW",
  heroImages: [
    { src: "/brand/hero-1.svg", width: 1290, height: 610, alt: "Illustration abstraite : galets empilés et feuillage" },
    { src: "/brand/hero-2.svg", width: 1290, height: 610, alt: "Illustration abstraite : vagues et soleil levant" },
  ],
  about: {
    title: "Prendre soin de soi",
    text: "Soins du visage et du corps, mains et pieds, coiffure et barbier : un parcours de réservation clair, pensé pour le mobile. Tous les sites, soins, prix et personnes présentés ici sont fictifs.",
    image: { src: "/brand/about.svg", width: 500, height: 477, alt: "Illustration abstraite : arches et feuilles" },
  },
  featured: [
    { title: "Rituel Lagune", description: "Un soin du corps enveloppant, entre gommage et détente." },
    { title: "Soin Lumière", description: "Un soin du visage pour un teint frais et éclatant." },
    { title: "Massage Détente", description: "Un moment de calme pour relâcher les tensions." },
    { title: "Rasage serviette chaude", description: "Le rituel du barbier, à l'ancienne." },
  ],
  process: [
    { title: "Diagnostic" },
    { title: "Soins", image: { src: "/brand/process-2.svg", width: 200, height: 200, alt: "Illustration abstraite : cercles" } },
    { title: "Conseils & suivi", image: { src: "/brand/process-3.svg", width: 200, height: 200, alt: "Illustration abstraite : feuilles" } },
  ],
  gift: {
    title: "Cartes cadeaux",
    text: "Simulation d'une carte cadeau : choisissez un montant fictif et prévisualisez la carte.",
    image: { src: "/brand/gift.svg", width: 500, height: 250, alt: "Illustration abstraite : carte et ruban" },
    amounts: [10000, 20000, 40000, 60000, 100000],
  },
  decorImage: { src: "/brand/decor.svg", width: 193, height: 158 },
};
