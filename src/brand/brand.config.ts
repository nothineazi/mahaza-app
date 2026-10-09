import type { BrandConfig } from "@/core/types";
import { homeCopy } from "@/brand/copy/home";
import { seedBookings, seedCategories, seedPractitioners, seedRooms, seedServices, seedSites } from "@/brand/seed/catalog";

/**
 * Configuration de Mahaza Beauty : identité, fonctionnalités activées, politiques par défaut.
 * C'est, avec le reste de `src/brand/`, le seul dossier qu'un dépôt client modifie. `src/core/**` ne lit la marque qu'ici.
 *
 * RÉEL (ancien site) : le nom de la marque, les noms des 5 sites et des soins.
 * FICTIF : prix, durées, adresses, numéros (MoMo, WhatsApp), horaires (à confirmer par site), personnel, clients.
 * Les numéros MoMo / WhatsApp ci-dessous sont des PLACEHOLDERS FICTIFS : ne jamais payer ni écrire à ces numéros.
 */
export const brand: BrandConfig = {
  name: "Mahaza Beauty",
  tagline: "Spa & institut de beauté",
  description: "Un voyage sensoriel au cœur du bien-être : soins du visage et du corps, hammam, beauté des mains et des pieds, coiffure. Réservez dans l'un de nos 5 spas.",
  logoText: "Mahaza",
  // Logo de l'ancien site (taille native 151 × 51 : ne pas agrandir au-delà de l'affichage).
  logoImage: { src: "/brand/logo.png", width: 151, height: 51, alt: "Mahaza Beauty" },
  city: "Douala · Yaoundé",
  address: "Adresse fictive (à confirmer)",
  // Horaires FICTIFS (à confirmer par site), identiques pour tous les sites.
  schedule: [
    { label: "Lundi – vendredi", days: [1, 2, 3, 4, 5], open: "08:30", close: "20:00" },
    { label: "Samedi", days: [6], open: "10:00", close: "20:00" },
    { label: "Dimanche", days: [0], open: "11:00", close: "20:00" },
  ],
  hoursToConfirm: true,
  // Adresse réservée à la documentation (TLD .invalid, RFC 2606) : ne reçoit jamais rien.
  contactEmail: "contact@mahaza-demo.invalid",
  socials: [],
  footerNote: "Démonstration du logiciel de réservation de Mahaza Beauty : aucune réservation n'est réellement enregistrée et aucun paiement n'est effectué. Les données marquées FICTIF sont inventées.",

  // Couleurs, polices et rayon : src/brand/theme/tokens.css (thèmes clair et sombre). Ici : couleur de la barre du navigateur.
  themeColor: { light: "#FEFAF1", dark: "#0F0A06" },

  features: {
    walkInQueue: false,
    groupBooking: false,
    depositByReliability: false,
  },

  opening: {
    open: "08:30",
    close: "20:00",
    closedDays: [],
    slotStepMin: 30,
    byDay: { 6: { open: "10:00", close: "20:00" }, 0: { open: "11:00", close: "20:00" } },
  },
  defaultDurationMin: 60, // FICTIF : durées réelles inconnues

  // Politiques par défaut. Toutes les valeurs sont des PLACEHOLDERS FICTIFS, à valider avec Mahaza (sauf la fourchette des cartes cadeaux : 20 000 – 100 000 FCFA, ancien site).
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
    // FICTIF : barème du « CA estimé » du back-office (jamais affiché côté client).
    fictivePriceByCategory: {
      "Beauté des mains et des pieds": 15000,
      "Soin de visage": 25000,
      "Soin du corps": 30000,
      "Épilation": 10000,
      "Beauté du regard": 20000,
      "Coiffure femme": 20000,
      "Soin pour homme": 12000,
      "Soin pour enfant (garçon et fille)": 8000,
    },
    giftCard: { minAmount: 20000, maxAmount: 100000, stepAmount: 5000, messageMax: 200 },
  },

  momo: { merchantNumber: "6 00 00 00 00", merchantName: "MAHAZA BEAUTY (FICTIF)" },
  whatsappNumber: "237600000000",
  referencePrefix: "MAH",

  sites: seedSites,
  categories: seedCategories,
  services: seedServices,
  practitioners: seedPractitioners,
  rooms: seedRooms,
  seedBookings,
  home: homeCopy,
};
