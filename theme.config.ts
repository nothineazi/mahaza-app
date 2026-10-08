import type { ThemeConfig } from "@/data/types";
import {
  ovaglowCategories,
  ovaglowPractitioners,
  ovaglowPremium,
  ovaglowRooms,
  ovaglowSeedBookings,
  ovaglowServices,
  ovaglowSites,
} from "@/data/ovaglow";

/**
 * Configuration de la marque OVAGLOW (marque FICTIVE de la souche).
 * Les numéros MoMo / WhatsApp ci-dessous sont des PLACEHOLDERS FICTIFS : ne jamais payer ni écrire à ces numéros.
 */
export const theme: ThemeConfig = {
  name: "OVAGLOW",
  tagline: "Institut & barbershop",
  description: "Marque fictive de démonstration : soins du visage et du corps, mains et pieds, coiffure et barbier. Réservez dans l'un de nos sites fictifs.",
  logoText: "OVAGLOW",
  city: "Ville fictive",
  address: "Adresse fictive",
  hoursLabel: "Lun – Ven · 9h – 19h | Sam · 9h – 18h | Dim · 10h – 16h (FICTIF)",
  // Horaires FICTIFS, identiques pour tous les sites.
  schedule: [
    { label: "Lundi – vendredi", days: [1, 2, 3, 4, 5], open: "09:00", close: "19:00" },
    { label: "Samedi", days: [6], open: "09:00", close: "18:00" },
    { label: "Dimanche", days: [0], open: "10:00", close: "16:00" },
  ],
  hoursToConfirm: false,
  // Adresse réservée à la documentation (TLD .invalid, RFC 2606) : ne reçoit jamais rien.
  contactEmail: "contact@ovaglow.invalid",
  socials: [],
  // Couleurs, polices et rayon : brand/theme/tokens.css (thèmes clair et sombre).
  themeColor: { light: "#F8F6F2", dark: "#0E1515" },
  opening: {
    open: "09:00",
    close: "19:00",
    closedDays: [],
    slotStepMin: 30,
    byDay: { 6: { open: "09:00", close: "18:00" }, 0: { open: "10:00", close: "16:00" } },
  },
  sites: ovaglowSites,
  categories: ovaglowCategories,
  services: ovaglowServices,
  practitioners: ovaglowPractitioners,
  rooms: ovaglowRooms,
  seedBookings: ovaglowSeedBookings,
  premium: ovaglowPremium,
  defaultDurationMin: 60, // FICTIF : durées réelles inconnues
  momo: { merchantNumber: "6 00 00 00 00", merchantName: "OVAGLOW (FICTIF)" },
  whatsappNumber: "237600000000",
  referencePrefix: "OVG",
  home: {
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
  },
};
