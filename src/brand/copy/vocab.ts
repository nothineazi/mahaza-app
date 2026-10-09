import type { Vocabulary } from "@/core/types";

/**
 * Vocabulaire d'OVAGLOW (marque FICTIVE, institut & barbershop). Un dépôt client remplace ce fichier : barbershop = « service » / « barbier »,
 * institut = « soin » / « praticien ». Le socle (`src/core`, `src/ui`) lit uniquement `vocab` et n'écrit jamais ces mots en dur (ADR-041).
 */
const cap = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** Dérive les formes plurielles et capitalisées à partir des deux mots masculins de la marque. */
export function makeVocab(
  words: { service: string; services: string; practitioner: string; practitioners: string },
  phrases: Pick<Vocabulary, "bookCta" | "discoverCta" | "navServices" | "featuredKicker" | "featuredTitle" | "composeTitle" | "catalogTitle" | "composeHint" | "searchExample">,
): Vocabulary {
  return {
    ...words,
    Service: cap(words.service),
    Services: cap(words.services),
    Practitioner: cap(words.practitioner),
    Practitioners: cap(words.practitioners),
    ...phrases,
  };
}

export const vocab: Vocabulary = makeVocab(
  { service: "soin", services: "soins", practitioner: "praticien", practitioners: "praticiens" },
  {
    bookCta: "Réserver un soin",
    discoverCta: "Découvrir nos soins",
    navServices: "Nos soins",
    featuredKicker: "Nos soins signature",
    featuredTitle: "Nos soins vedettes",
    composeTitle: "Composez votre moment",
    catalogTitle: "Nos services",
    composeHint: "Composez votre moment : plusieurs soins peuvent s'enchaîner sur un même créneau.",
    searchExample: "massage, manucure…",
  },
);
