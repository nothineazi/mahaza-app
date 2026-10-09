import type { HomeContent } from "@/core/types";

/**
 * Textes et visuels de l'accueil de Mahaza Beauty. Textes et photos repris de l'ancien site de la marque (avec l'accord de Yass pour la démonstration) ;
 * les médias sont servis depuis `public/brand/` (WebP convertis depuis les PNG d'origine, mêmes dimensions). Droits et consentements des personnes
 * photographiées : à confirmer avec Mahaza avant toute mise en production.
 */
export const homeCopy: HomeContent = {
  heroKicker: "Un voyage sensoriel au cœur du bien-être",
  heroTitle: "Bienvenue à Mahaza Beauty",
  heroImages: [
    { src: "/brand/hero-1.webp", width: 1290, height: 610, alt: "Soin des pieds au spa Mahaza : plateau de gommages et fleurs" },
    { src: "/brand/hero-2.webp", width: 1290, height: 610, alt: "Soin du visage au spa Mahaza" },
  ],
  about: {
    title: "La magie du bien-être",
    text: "Hammam, soins du visage et du corps, beauté des mains et des pieds, épilation, regard, coiffure : des soins pour femme, homme et enfant, dans nos 5 spas à Douala et Yaoundé.",
    image: { src: "/brand/about.webp", width: 500, height: 477, alt: "Pédicure spa chez Mahaza" },
  },
  featured: [
    { title: "Rituel endocrinien sensuel", description: "Hammam, gommage sensuel et masque à la fleur de rose.", icon: "flower" },
    { title: "Soin hydrafacial", description: "Nettoie en profondeur et purifie la peau pour un teint frais et éclatant.", icon: "droplets" },
    { title: "Relaxation ultime", description: "Jacuzzi, massage relaxant et détente, soin de visage.", icon: "waves" },
    { title: "Manucure et pédicure spa", description: "Un soin luxueux pour des mains et des pieds doux et élégants.", icon: "hand" },
  ],
  process: [
    { title: "Diagnostic" },
    { title: "Soins", image: { src: "/brand/process-2.webp", width: 200, height: 200, alt: "Soin du visage" } },
    { title: "Conseils & suivi", image: { src: "/brand/process-3.webp", width: 200, height: 200, alt: "Conseils et suivi après le soin" } },
  ],
  gift: {
    title: "Cartes cadeaux",
    text: "Offrez un moment de bien-être. Choisissez le montant de la carte cadeau : simulation FICTIVE, aucune carte n'est réellement émise ni payée.",
    image: { src: "/brand/gift.webp", width: 500, height: 250, alt: "Carte cadeau avec ruban rouge" },
    // Paliers de 20 000 à 100 000 FCFA (fourchette de l'ancien site ; pas exact à confirmer par Mahaza).
    amounts: [20000, 40000, 60000, 80000, 100000],
  },
  decorImage: { src: "/brand/flower.webp", width: 193, height: 158 },
};
