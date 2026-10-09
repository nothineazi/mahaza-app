import { brand } from "../src/brand/brand.config";
import { vocab } from "../src/brand/copy/vocab";
import { formatPrice } from "../src/core/lib/utils";

/**
 * Valeurs de la marque active utilisées par les scénarios e2e : les scénarios ne contiennent aucun nom de marque, de site ou de
 * prestation en dur, donc la même suite passe dans la souche et dans chaque dépôt client.
 */
const sites = brand.sites ?? [];
if (sites.length === 0) throw new Error("e2e : la marque doit déclarer au moins un site");

// Deux prestations de catégories différentes (praticiens et salles distincts), prises dans l'ordre du catalogue.
const firstService = brand.services[0];
const secondService = brand.services.find((s) => s.category !== firstService.category) ?? brand.services[1];

const exact = (name: string) => new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);

export const data = {
  brandName: brand.name,
  heroTitle: brand.home.heroTitle,
  siteName: sites[0].name,
  siteButton: exact(sites[0].name),
  serviceA: firstService.name,
  serviceB: secondService.name,
  /** Nom accessible des boutons d'ajout au panier. */
  serviceAButton: new RegExp(firstService.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  serviceBButton: new RegExp(secondService.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  reference: new RegExp(`${brand.referencePrefix}-\\d{4}`),
  icsFile: new RegExp(`^rdv-${brand.referencePrefix}-\\d{4}\\.ics$`),
  icsSummary: `SUMMARY:[DÉMO] ${brand.name}`,
  composeTitle: vocab.composeTitle,
  practitionerTitle: `Votre ${vocab.practitioner}`,
  catalogTitle: vocab.catalogTitle,
  /** Début de la mention de pied de page (`brand.footerNote`). */
  footerNote: (brand.footerNote ?? "Marque fictive de démonstration. Aucune réservation").slice(0, 40),
  cartSummaryButton: new RegExp(`Voir le récapitulatif|1 ${vocab.service}`),
  referencePrefix: brand.referencePrefix,
  /** Premier palier de la carte cadeau (bouton de montant). */
  giftAmountButton: new RegExp(`^${formatPrice(brand.home.gift.amounts[0]).replace(/\s+/g, " ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
};
