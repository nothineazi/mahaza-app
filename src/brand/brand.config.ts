import type { BrandConfig } from "@/core/types";
import { homeCopy } from "@/brand/copy/home";
import { seedBookings, seedCategories, seedPractitioners, seedRooms, seedServices, seedSites } from "@/brand/seed/catalog";

/**
 * Configuration de la marque OVAGLOW (marque FICTIVE de la souche) : identité, fonctionnalités activées, politiques par défaut.
 * C'est, avec le reste de `src/brand/`, le seul dossier qu'un dépôt client modifie. `src/core/**` ne lit la marque qu'ici.
 *
 * Les numéros MoMo / WhatsApp ci-dessous sont des PLACEHOLDERS FICTIFS : ne jamais payer ni écrire à ces numéros.
 */
export const brand: BrandConfig = {
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

  // Couleurs, polices et rayon : src/brand/theme/tokens.css (thèmes clair et sombre). Ici : couleur de la barre du navigateur.
  themeColor: { light: "#F8F6F2", dark: "#0E1515" },

  // Fonctionnalités du socle activables par marque. Non construites au RUN-01 : drapeaux uniquement, à `false`.
  features: {
    walkInQueue: false,
    groupBooking: false,
    depositByReliability: false,
  },

  opening: {
    open: "09:00",
    close: "19:00",
    closedDays: [],
    slotStepMin: 30,
    byDay: { 6: { open: "09:00", close: "18:00" }, 0: { open: "10:00", close: "16:00" } },
  },
  defaultDurationMin: 60, // FICTIF : durées réelles inconnues

  // Politiques par défaut. Toutes les valeurs sont des PLACEHOLDERS FICTIFS, à fixer par chaque marque.
  policies: {
    depositHoldMin: 30,
    maxCartItems: 5,
    seedHoldMin: 360,
    loyalty: {
      pointsPerVisit: 10,
      tiers: [
        { label: "Découverte", minPoints: 0 },
        { label: "Argent", minPoints: 30 },
        { label: "Or", minPoints: 60 },
      ],
    },
    fictivePriceByCategory: {
      "Soins du visage": 18000,
      "Soins du corps": 25000,
      "Mains et pieds": 10000,
      "Coiffure": 20000,
      "Barbier": 6000,
    },
    giftCard: { minAmount: 10000, maxAmount: 100000, stepAmount: 5000, messageMax: 200 },
  },

  momo: { merchantNumber: "6 00 00 00 00", merchantName: "OVAGLOW (FICTIF)" },
  whatsappNumber: "237600000000",
  referencePrefix: "OVG",

  sites: seedSites,
  categories: seedCategories,
  services: seedServices,
  practitioners: seedPractitioners,
  rooms: seedRooms,
  seedBookings,
  home: homeCopy,
};
