export interface Service {
  id: string;
  name: string;
  /** Optionnelle : vide si le site d'origine n'en donne pas. */
  description?: string;
  category: string;
  /** Optionnelle : vide si inconnue (la démo applique alors `BrandConfig.defaultDurationMin`). */
  durationMin?: number;
  /** Prix en FCFA (XAF). Optionnel : s'il est vide, l'UI n'affiche aucun prix. */
  price?: number;
}

/** Un site physique (institut, barbershop). Les marques mono-site n'en déclarent pas (voir `BrandConfig.sites`). */
export interface Site {
  id: string;
  name: string;
  /** Optionnelle : ville non confirmée pour certains sites. */
  city?: string;
  /** « Adresse à confirmer » tant que l'adresse réelle n'est pas connue. */
  address: string;
  /** Acompte forfaitaire en FCFA. FICTIF (placeholder de démo), configurable par site. */
  depositAmount?: number;
  /** Délai (minutes) avant annulation du créneau si l'acompte n'est pas reçu. FICTIF ; surcharge `BrandPolicies.depositHoldMin`. */
  depositHoldMin?: number;
}

export interface Practitioner {
  id: string;
  name: string;
  role: string;
  serviceIds: string[];
  active: boolean;
  /** Site auquel le praticien appartient (absent = site unique). */
  siteId?: string;
  /** Donnée de démo inventée : l'UI affiche le badge FICTIF. */
  fictive?: boolean;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  /** Catégories de services pouvant se dérouler dans cette salle. */
  categories: string[];
  active: boolean;
  siteId?: string;
  /** Donnée de démo inventée : l'UI affiche le badge FICTIF. */
  fictive?: boolean;
}

/** Réservation seed : la date est exprimée en jours depuis le lundi de la semaine en cours. */
export interface SeedBooking {
  id: string;
  serviceId: string;
  practitionerId: string;
  roomId: string;
  dayOffset: number;
  start: string;
  customerName: string;
  customerPhone: string;
  depositReceived: boolean;
  siteId?: string;
}

export interface Booking {
  id: string;
  reference: string;
  siteId?: string;
  serviceId: string;
  practitionerId: string;
  roomId: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  start: string;
  durationMin: number;
  /** Absent si le service n'a pas de prix. */
  price?: number;
  customerName: string;
  customerPhone: string;
  depositAmount: number;
  depositReceived: boolean;
}

// ---------------------------------------------------------------------------
// Rendu « premium » : réservations multi-soins, cycle de vie, clients.
// ---------------------------------------------------------------------------

export type BookingStatus = "pending_deposit" | "confirmed" | "completed" | "cancelled" | "no_show";

/** Un soin d'une réservation. Les lignes d'une même réservation s'enchaînent sans interruption. */
export interface ReservationLine {
  serviceId: string;
  practitionerId: string;
  roomId: string;
  /** HH:mm */
  start: string;
  /** Durée du créneau : durée du service si connue, sinon durée par défaut FICTIVE. */
  durationMin: number;
  /** Le client n'avait pas de préférence : le praticien a été attribué automatiquement. */
  noPreference: boolean;
}

export interface Reservation {
  id: string;
  reference: string;
  siteId: string;
  clientId: string;
  customerName: string;
  customerPhone: string;
  /** YYYY-MM-DD */
  date: string;
  /** Epoch ms de création. */
  createdAt: number;
  /** Epoch ms d'expiration de l'acompte (créneau libéré ensuite), null si sans objet. */
  holdExpiresAt: number | null;
  status: BookingStatus;
  depositAmount: number;
  lines: ReservationLine[];
  /** Epoch ms d'ouverture du rappel WhatsApp J-1 (démo). */
  reminderSentAt?: number;
  source: "seed" | "web";
  /** Donnée de démo inventée. */
  fictive?: boolean;
}

/** Réservation de démo : les horaires des lignes sont calculés au chargement (voir `core/booking/seed.ts`). */
export interface DemoReservationSeed {
  id: string;
  siteId: string;
  clientId: string;
  /** Jours depuis le lundi de la semaine en cours (négatif = semaines passées). */
  dayOffset: number;
  start: string;
  lines: { serviceId: string; practitionerId: string; roomId: string }[];
  /** Statut imposé (historique) ; absent = dérivé de la date et de `depositReceived`. */
  status?: BookingStatus;
  depositReceived: boolean;
  /** Réservation de la semaine en cours (seed d'origine). */
  current: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  homeSiteId: string;
  notes: string;
  /** Points de fidélité bonus (FICTIF), en plus des visites terminées. */
  bonusPoints: number;
  /** Donnée de démo inventée. */
  fictive?: boolean;
}

export interface LoyaltyTier {
  label: string;
  minPoints: number;
}

/** Politiques par défaut de la marque (acompte, panier, fidélité, cartes cadeaux). Dans la souche, toutes les valeurs sont FICTIVES. */
export interface BrandPolicies {
  /** Délai d'expiration de l'acompte, en minutes (FICTIF). */
  depositHoldMin: number;
  /** Nombre maximal de soins dans une réservation. */
  maxCartItems: number;
  /** Délai long appliqué aux acomptes en attente des réservations seed (FICTIF), en minutes. */
  seedHoldMin: number;
  loyalty: { pointsPerVisit: number; tiers: LoyaltyTier[] };
  /** FICTIF : barème par catégorie, utilisé uniquement pour le CA estimé du back-office. */
  fictivePriceByCategory: Record<string, number>;
  giftCard: { minAmount: number; maxAmount: number; stepAmount: number; messageMax: number };
}

/** Horaires d'une plage de jours (0 = dimanche … 6 = samedi). */
export interface ScheduleRange {
  label: string;
  days: number[];
  open: string;
  close: string;
}

export interface SocialLink {
  network: "facebook" | "instagram" | "tiktok" | "twitter" | "linkedin";
  label: string;
  url: string;
}

export interface BrandImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** Pictogrammes disponibles pour les prestations vedettes de l'accueil (`FeaturedCare.icon`). */
export type FeaturedIcon = "flower" | "droplets" | "waves" | "hand" | "scissors" | "sparkles" | "flame" | "crown";

export interface FeaturedCare {
  title: string;
  description: string;
  /** Pictogramme ; absent = rotation par défaut selon la position. */
  icon?: FeaturedIcon;
}

/** Contenu éditorial de l'accueil (`src/brand/copy/home.ts`). */
export interface HomeContent {
  heroKicker: string;
  heroTitle: string;
  heroImages: { src: string; width: number; height: number; alt: string }[];
  about: { title: string; text: string; image: { src: string; width: number; height: number; alt: string } };
  featured: FeaturedCare[];
  process: { title: string; image?: { src: string; width: number; height: number; alt: string } }[];
  gift: { title: string; text: string; image: { src: string; width: number; height: number; alt: string }; amounts: number[] };
  decorImage: { src: string; width: number; height: number };
}

/**
 * Vocabulaire de la marque (`src/brand/copy/vocab.ts`) : institut (soin, praticien) ou barbershop (service, barbier).
 * Les formes au pluriel et en capitale sont dérivées par `makeVocab`. Le socle n'écrit jamais ces mots en dur.
 */
export interface Vocabulary {
  service: string;
  services: string;
  Service: string;
  Services: string;
  practitioner: string;
  practitioners: string;
  Practitioner: string;
  Practitioners: string;
  /** Libellé du bouton principal de l'accueil. */
  bookCta: string;
  /** Lien du héros vers la section des prestations vedettes. */
  discoverCta: string;
  /** Entrée du menu public vers cette section. */
  navServices: string;
  featuredKicker: string;
  featuredTitle: string;
  /** Titre de l'étape « choix des prestations » du tunnel de réservation. */
  composeTitle: string;
  /** Titre de la section catalogue de l'accueil. */
  catalogTitle: string;
  /** Aide de l'étape « choix des prestations ». */
  composeHint: string;
  /** Exemple dans le champ de recherche de l'étape « choix des prestations ». */
  searchExample: string;
}

/** Fonctionnalités optionnelles du socle, activées par chaque marque (`brand.config.ts`). Non construites au RUN-01 : le drapeau seul existe. */
export interface BrandFeatures {
  /** File d'attente walk-in (barbershop) — RUN-11. */
  walkInQueue: boolean;
  /** Réservation groupée / mariée — RUN-12. */
  groupBooking: boolean;
  /** Acompte modulé selon la fiabilité du client — RUN-11. */
  depositByReliability: boolean;
}

export interface BrandConfig {
  name: string;
  tagline: string;
  description: string;
  /** Wordmark texte de la marque (affiché par `BrandLogo`). */
  logoText: string;
  /** Logo complet (image dans `public/brand/`) : remplace la pastille et le wordmark. Posé sur une plaque claire en thème sombre. */
  logoImage?: BrandImage;
  /** Pastille de marque (image dans `public/brand/`) : remplace la pastille par défaut, le wordmark texte reste affiché à côté. */
  logoMark?: BrandImage;
  /** Mention en bas de page (démo). Par défaut : « Marque fictive de démonstration… ». */
  footerNote?: string;
  city: string;
  address: string;
  /** Horaires détaillés (affichés tels quels) ; `hoursToConfirm` ajoute la mention « à confirmer par site ». */
  schedule?: ScheduleRange[];
  hoursToConfirm?: boolean;
  contactEmail?: string;
  socials?: SocialLink[];
  home: HomeContent;
  /** Fonctionnalités activées pour la marque (toutes à `false` par défaut dans la souche). */
  features: BrandFeatures;
  /** Liste des sites. Absente ou à un seul élément : l'étape « choix du site » n'apparaît pas. */
  sites?: Site[];
  /** Durée du créneau quand le service n'a pas de durée. FICTIF. */
  defaultDurationMin?: number;
  /** Couleur de la barre du navigateur (hex), alignée sur `--background` de `src/brand/theme/tokens.css`. */
  themeColor: { light: string; dark: string };
  opening: {
    open: string;
    close: string;
    /** 0 = dimanche … 6 = samedi */
    closedDays: number[];
    slotStepMin: number;
    /** Surcharge par jour de semaine (0 = dimanche) ; `null` = fermé. Prioritaire sur open/close. */
    byDay?: Partial<Record<number, { open: string; close: string } | null>>;
  };
  categories: string[];
  services: Service[];
  practitioners: Practitioner[];
  rooms: Room[];
  seedBookings: SeedBooking[];
  /** Politiques par défaut (acompte, panier, fidélité, cartes cadeaux). */
  policies: BrandPolicies;
  /** Acompte en % du prix du service (ignoré si le site définit un acompte forfaitaire). */
  depositPercent?: number;
  momo: {
    /** PLACEHOLDER : numéro marchand fictif. */
    merchantNumber: string;
    merchantName: string;
  };
  /** PLACEHOLDER : format international sans « + » (wa.me). */
  whatsappNumber: string;
  referencePrefix: string;
}
