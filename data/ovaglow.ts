import type { Practitioner, PremiumConfig, Room, SeedBooking, Service, Site } from "./types";

/**
 * Données de la marque OVAGLOW (marque FICTIVE de la souche).
 *
 * TOUT est FICTIF : sites, soins, prix, praticiens, salles, réservations. Aucune adresse, aucun numéro, aucune personne réelle.
 * Chaque entrée de personne ou de lieu porte `fictive: true` (badge « FICTIF » dans l'UI).
 * Un dépôt client remplace ce fichier (et `theme.config.ts`) par ses données ; ce fichier n'est jamais déployé.
 */

// ---------------------------------------------------------------------------
// Sites (FICTIFS)
// ---------------------------------------------------------------------------

/** FICTIF : acompte forfaitaire de démonstration, en FCFA, configurable par site. */
const FICTIVE_DEPOSIT_FCFA = 5000;

const ADDRESS_FICTIVE = "Adresse fictive";

export const ovaglowSites: Site[] = [
  { id: "site-aurore", name: "Site Aurore", city: "Ville fictive", address: ADDRESS_FICTIVE, depositAmount: FICTIVE_DEPOSIT_FCFA },
  { id: "site-brise", name: "Site Brise", city: "Ville fictive", address: ADDRESS_FICTIVE, depositAmount: FICTIVE_DEPOSIT_FCFA },
  { id: "site-cedre", name: "Site Cèdre", city: "Ville fictive", address: ADDRESS_FICTIVE, depositAmount: FICTIVE_DEPOSIT_FCFA },
];

// ---------------------------------------------------------------------------
// Catalogue (FICTIF) — noms, prix indicatifs en FCFA ; durées non renseignées (créneaux de 60 min FICTIFS)
// ---------------------------------------------------------------------------

const CATALOG = [
  {
    key: "vi",
    category: "Soins du visage",
    services: [["Soin Lumière", 18000], ["Soin Pureté", 20000], ["Gommage doux", 12000], ["Masque Hydra", 15000]],
  },
  {
    key: "co",
    category: "Soins du corps",
    services: [["Massage Détente", 25000], ["Gommage Sable", 18000], ["Rituel Lagune", 35000], ["Enveloppement Argile", 22000]],
  },
  {
    key: "mp",
    category: "Mains et pieds",
    services: [["Manucure express", 8000], ["Manucure complète", 12000], ["Pédicure complète", 15000], ["Pose de vernis", 5000]],
  },
  {
    key: "cf",
    category: "Coiffure",
    services: [["Coupe et brushing", 15000], ["Soin capillaire Nutrition", 12000], ["Coiffure événement", 25000], ["Coloration", 30000]],
  },
  {
    key: "ba",
    category: "Barbier",
    services: [["Coupe homme", 5000], ["Dégradé", 6000], ["Taille de barbe", 4000], ["Rasage serviette chaude", 8000]],
  },
] as const;

type CatKey = (typeof CATALOG)[number]["key"];

const slug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Identifiant stable d'un service : `<clé catégorie>-<nom slugifié>`. */
const sid = (key: CatKey, name: string) => `${key}-${slug(name)}`;

export const ovaglowCategories: string[] = CATALOG.map((c) => c.category);

export const ovaglowServices: Service[] = CATALOG.flatMap((c) =>
  c.services.map(([name, price]): Service => ({ id: sid(c.key, name), name, category: c.category, price })),
);

const idsOf = (key: CatKey) => CATALOG.find((c) => c.key === key)!.services.map(([n]) => sid(key, n));

// ---------------------------------------------------------------------------
// Praticiens et salles par site (FICTIFS)
// ---------------------------------------------------------------------------

type RoleKey = "face" | "body" | "nails" | "hair" | "barber";

const ROLES: Record<RoleKey, { role: string; serviceIds: string[] }> = {
  face: { role: "Esthéticienne", serviceIds: idsOf("vi") },
  body: { role: "Spa-thérapeute", serviceIds: idsOf("co") },
  nails: { role: "Prothésiste ongulaire", serviceIds: idsOf("mp") },
  hair: { role: "Coiffeur·se", serviceIds: idsOf("cf") },
  barber: { role: "Barbier", serviceIds: idsOf("ba") },
};
const ROLE_ORDER: RoleKey[] = ["face", "body", "nails", "hair", "barber"];

// Noms inventés (FICTIF), un par rôle et par site.
const STAFF_NAMES: Record<string, string[]> = {
  "site-aurore": ["Inès M.", "Lucas B.", "Sana K.", "Maëlle D.", "Karim T."],
  "site-brise": ["Awa S.", "Théo R.", "Nadia L.", "Eliot P.", "Moussa C."],
  "site-cedre": ["Léa F.", "Hugo N.", "Yasmine O.", "Chloé V.", "Samir A."],
};

export const ovaglowPractitioners: Practitioner[] = ovaglowSites.flatMap((site) =>
  ROLE_ORDER.map((role, i): Practitioner => ({
    id: `${site.id}-p${i + 1}`,
    siteId: site.id,
    name: STAFF_NAMES[site.id][i],
    role: ROLES[role].role,
    serviceIds: ROLES[role].serviceIds,
    active: true,
    fictive: true,
  })),
);

const ROOM_DEFS = [
  { key: "visage", name: "Cabine visage", description: "Soins du visage.", categories: ["Soins du visage"] },
  { key: "corps", name: "Cabine corps", description: "Massages, gommages et rituels.", categories: ["Soins du corps"] },
  { key: "mains", name: "Espace mains & pieds", description: "Postes de manucure et de pédicure.", categories: ["Mains et pieds"] },
  { key: "coiffure", name: "Salon de coiffure", description: "Espace coiffure avec bacs de lavage.", categories: ["Coiffure"] },
  { key: "barbier", name: "Espace barbier", description: "Fauteuils de barbier.", categories: ["Barbier"] },
] as const;

export const ovaglowRooms: Room[] = ovaglowSites.flatMap((site) =>
  ROOM_DEFS.map((r): Room => ({
    id: `${site.id}-r-${r.key}`,
    siteId: site.id,
    name: r.name,
    description: r.description,
    categories: [...r.categories],
    active: true,
    fictive: true,
  })),
);

// ---------------------------------------------------------------------------
// Réservations seed par site (FICTIF : clients, horaires, statuts d'acompte)
// ---------------------------------------------------------------------------

/** [jour (0 = lundi de la semaine en cours), heure, clé catégorie, nom du service, acompte reçu] */
type SeedRow = [number, string, CatKey, string, boolean];

// Créneaux de 60 min (durée par défaut FICTIVE). Horaires FICTIFS : lun–ven 9h–19h, sam 9h–18h, dim 10h–16h.
const SEED_ROWS: Record<string, SeedRow[]> = {
  "site-aurore": [
    [0, "09:30", "vi", "Soin Lumière", true],
    [0, "11:00", "mp", "Manucure complète", true],
    [1, "10:00", "ba", "Dégradé", true],
    [1, "14:00", "co", "Rituel Lagune", false],
    [2, "15:30", "cf", "Coupe et brushing", false],
    [3, "09:00", "co", "Massage Détente", true],
    [4, "16:00", "mp", "Pédicure complète", false],
    [5, "11:00", "vi", "Masque Hydra", true],
    [6, "11:00", "ba", "Taille de barbe", false],
  ],
  "site-brise": [
    [0, "10:00", "ba", "Coupe homme", true],
    [1, "09:30", "vi", "Soin Pureté", true],
    [1, "13:00", "co", "Gommage Sable", false],
    [2, "11:30", "mp", "Pose de vernis", true],
    [3, "14:30", "cf", "Soin capillaire Nutrition", true],
    [4, "10:00", "ba", "Rasage serviette chaude", false],
    [5, "12:00", "co", "Enveloppement Argile", true],
    [6, "13:00", "vi", "Gommage doux", false],
  ],
  "site-cedre": [
    [0, "09:00", "co", "Massage Détente", true],
    [0, "12:00", "vi", "Soin Lumière", false],
    [1, "10:30", "cf", "Coloration", true],
    [2, "14:00", "mp", "Manucure express", true],
    [3, "09:30", "ba", "Dégradé", true],
    [3, "16:00", "cf", "Coiffure événement", false],
    [4, "11:00", "mp", "Pédicure complète", true],
    [5, "13:00", "co", "Rituel Lagune", false],
    [6, "12:00", "ba", "Coupe homme", true],
  ],
};

// Noms inventés (FICTIF).
const CUSTOMERS = [
  "Alice Dupré", "Bruno Tessier", "Camille Rivière", "Dora Mensah", "Émile Vasseur", "Fanny Colombe",
  "Gaël Marchetti", "Hélène Aubry", "Ibrahim Lefort", "Jade Moreau", "Kévin Barrault", "Lina Chevalier",
  "Mathis Perrin", "Noémie Gauthier", "Omar Benali", "Pauline Roussel", "Quentin Lacroix", "Rita Fontaine",
  "Sofia Navarro", "Tom Delmas", "Ursule Pichon", "Victor Hamel", "Wendy Lambert", "Xavier Costa",
  "Yanis Morel", "Zoé Brunet", "Adèle Fabre", "Basile Carré",
];

let customerIdx = 0;
export const ovaglowSeedBookings: SeedBooking[] = ovaglowSites.flatMap((site) => {
  const siteRooms = ovaglowRooms.filter((r) => r.siteId === site.id);
  const sitePractitioners = ovaglowPractitioners.filter((p) => p.siteId === site.id);
  return SEED_ROWS[site.id].map(([dayOffset, start, key, name, depositReceived], i): SeedBooking => {
    const serviceId = sid(key, name);
    const category = CATALOG.find((c) => c.key === key)!.category;
    const n = customerIdx++;
    return {
      id: `b-${site.id}-${i + 1}`,
      siteId: site.id,
      serviceId,
      practitionerId: sitePractitioners.find((p) => p.serviceIds.includes(serviceId))!.id,
      roomId: siteRooms.find((r) => r.categories.includes(category))!.id,
      dayOffset,
      start,
      customerName: CUSTOMERS[n % CUSTOMERS.length],
      // Numéros fictifs : plage de test, jamais joignables.
      customerPhone: `+237 600 00 00 ${String(n + 1).padStart(2, "0")}`,
      depositReceived,
    };
  });
});

// ---------------------------------------------------------------------------
// Réglages premium (FICTIFS)
// ---------------------------------------------------------------------------

/**
 * Toutes les valeurs ci-dessous sont des PLACEHOLDERS de démonstration, à remplacer par chaque dépôt client :
 * délais d'acompte, limites, règles de fidélité et barème du CA estimé.
 */
export const ovaglowPremium: PremiumConfig = {
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
};
